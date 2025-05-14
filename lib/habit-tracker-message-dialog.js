"use babel";

import React, { useEffect, useState } from "react";
import { useModal } from "inkdrop";

const getToday = () => new Date().toISOString().slice(0, 10);

const getLastNDays = (n) => {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
};

const computeStreaks = (log = {}) => {
  const today = new Date().toISOString().slice(0, 10);
  const allDates = Object.keys(log).sort();

  let max = 0;
  let current = 0;
  let streak = 0;

  for (let i = 0; i < allDates.length; i++) {
    const date = allDates[i];
    if (log[date]) {
      streak++;
      max = Math.max(max, streak);
    } else {
      streak = 0;
    }
  }

  // Compute current streak up to today
  const pastDates = allDates
    .filter((d) => d <= today)
    .sort()
    .reverse();
  for (let date of pastDates) {
    if (log[date]) {
      current++;
    } else {
      break;
    }
  }

  return { current, max };
};

const HabitTrackerMessageDialog = () => {
  const modal = useModal();
  const { Dialog } = inkdrop.components.classes;
  const [habits, setHabits] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const days = getLastNDays(7);

  const defaultHabits = [
    { name: "Habit 1", log: {} },
    { name: "Habit 2", log: {} },
    { name: "Habit 3", log: {} },
  ];

  const loadHabits = () => {
    const saved = inkdrop.config.get("habit-tracker.habits");
    if (saved && saved.length > 0) {
      setHabits(saved);
    } else {
      inkdrop.config.set("habit-tracker.habits", defaultHabits);
      setHabits(defaultHabits);
    }
  };

  const saveHabits = (updated) => {
    setHabits(updated);
    inkdrop.config.set("habit-tracker.habits", updated);
  };

  const toggleDay = (habitIndex, date) => {
    const updated = [...habits];
    const habit = updated[habitIndex];
    if (!habit.log) habit.log = {};
    habit.log[date] = !habit.log[date];
    saveHabits(updated);
  };

  const addHabit = () => {
    if (newHabitName.trim() === "") return;
    const newHabit = { name: newHabitName.trim(), log: {} };
    saveHabits([...habits, newHabit]);
    setNewHabitName("");
    setIsAdding(false);
  };

  useEffect(() => {
    loadHabits();
    const sub = inkdrop.commands.add(document.body, {
      "habit-tracker:toggle": () => modal.show(),
    });
    return () => sub.dispose();
  }, []);

  return (
    <Dialog {...modal.state} onBackdropClick={modal.close}>
      <Dialog.Title>Habit Tracker</Dialog.Title>
      <Dialog.Content>
        <table className="ui celled table">
          <thead>
            <tr>
              <th>Habit</th>
              {days.map((day) => (
                <th key={day}>{day.slice(5)}</th>
              ))}
              <th>🔥 Current</th>
              <th>🏆 Max</th>
            </tr>
          </thead>
          <tbody>
            {habits.map((habit, hIndex) => {
              const log = habit.log || {};
              const { current, max } = computeStreaks(log);

              return (
                <tr key={hIndex}>
                  <td>
                    {habit.isEditing ? (
                      <div style={{ display: "flex", gap: "6px" }}>
                        <input
                          type="text"
                          value={habit.tempName}
                          onChange={(e) => {
                            const updated = [...habits];
                            updated[hIndex].tempName = e.target.value;
                            setHabits(updated);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const updated = [...habits];
                              updated[hIndex].name = updated[hIndex].tempName;
                              delete updated[hIndex].isEditing;
                              delete updated[hIndex].tempName;
                              saveHabits(updated);
                            }
                          }}
                          autoFocus
                        />
                        <button
                          className="ui mini icon button"
                          onClick={() => {
                            const updated = [...habits];
                            updated[hIndex].name = updated[hIndex].tempName;
                            delete updated[hIndex].isEditing;
                            delete updated[hIndex].tempName;
                            saveHabits(updated);
                          }}
                        >
                          ✅
                        </button>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span>{habit.name}</span>
                        <span>
                          <button
                            className="ui mini icon button"
                            title="Edit"
                            onClick={() => {
                              const updated = [...habits];
                              updated[hIndex].isEditing = true;
                              updated[hIndex].tempName = updated[hIndex].name;
                              setHabits(updated);
                            }}
                          >
                            ✏️
                          </button>
                          <button
                            className="ui mini red icon button"
                            title="Delete"
                            onClick={() => {
                              if (
                                confirm(
                                  `Are you sure you want to delete "${habit.name}"?`,
                                )
                              ) {
                                const updated = habits.filter(
                                  (_, i) => i !== hIndex,
                                );
                                saveHabits(updated);
                              }
                            }}
                          >
                            🗑️
                          </button>
                        </span>
                      </div>
                    )}
                  </td>

                  {days.map((date) => (
                    <td key={date} style={{ textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={log[date] || false}
                        onChange={() => toggleDay(hIndex, date)}
                      />
                    </td>
                  ))}
                  <td>{current}</td>
                  <td>{max}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Dialog.Content>

      <div style={{ marginTop: "1em", padding: "0 1rem" }}>
        {isAdding ? (
          <div style={{ display: "flex", gap: "6px" }}>
            <input
              type="text"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addHabit();
              }}
              autoFocus
            />
            <button className="ui mini icon button" onClick={addHabit}>
              ✅
            </button>
            <button
              className="ui mini button"
              onClick={() => setIsAdding(false)}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            className="ui button primary"
            onClick={() => setIsAdding(true)}
          >
            ➕ Add New Habit
          </button>
        )}
      </div>

      <Dialog.Actions>
        <button className="ui button" onClick={modal.close}>
          Close
        </button>
      </Dialog.Actions>
    </Dialog>
  );
};

export default HabitTrackerMessageDialog;
