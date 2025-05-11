"use babel";

import HabitTrackerMessageDialog from "./habit-tracker-message-dialog";

module.exports = {
  activate() {
    inkdrop.components.registerClass(HabitTrackerMessageDialog);
    inkdrop.layouts.addComponentToLayout("modal", "HabitTrackerMessageDialog");

    console.log("Habit Tracker plugin activated");
  },

  deactivate() {
    inkdrop.layouts.removeComponentFromLayout(
      "modal",
      "HabitTrackerMessageDialog",
    );
    inkdrop.components.deleteClass(HabitTrackerMessageDialog);

    console.log("Habit Tracker Plugin Deactivated");
  },
};
