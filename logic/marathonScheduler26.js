// call marathonScheduler26();
module.exports = marathonScheduler26;

showLogs = true; //true = shows lots of console log stuff, false shows "ERROR containing messages only"
function logthis(stuff) {
  if (showLogs || stuff.includes("ERROR")) {
    console.log(stuff);
  }
}

tester = {
  mpw: 10,
  days: ["1", "3", "4", "6"],
  longRun: "6",
  goalDistance: 26.2,
  raceName: "Fun Run",
  raceDate: "2020-01-01"
};
marathonScheduler26(tester);

function marathonScheduler26(data) {
  //set trainingStartDate as tomorrow in format "2019-11-30"
  let calculateStartDate = new Date().setDate(new Date().getDate() + 1);
  calculateStartDate =
    new Date(calculateStartDate).toJSON().substr(0, 10) + "T12:00:00";

  let runnerData = [];
  let day = [];

  if (data === undefined) {
    logthis(
      "ERROR! ***** data for runner was undefined, using sample data *****"
    );
    // setup sample data
    // sample Race date is today + ??? days *********************************************************************
    let sampleRaceDate = new Date().setDate(new Date().getDate() + 125);
    sampleRaceDate = new Date(sampleRaceDate).toJSON().substr(0, 10);
    //console.log("date = "+new Date(Date.now()).toJSON().substr(0, 10) );
    let sampleData = [];

    sampleData = {
      mpw: 10,
      days: ["1", "3", "4", "6"],
      longRun: "6",
      goalDistance: 26.2,
      raceName: "Fun Run",
      raceDate: "2020-01-01"
    };
    // use sampleDate

    runnerData = sampleData;
  } else {
    runnerData = data;
  }
  // add trainingStartDate in anticipation of this being an option in future, currently starts "tomorrow"
  runnerData.startDate = calculateStartDate;
  logthis("runnerData = " + JSON.stringify(runnerData));

  // convert incoming number strings to numbers:
  runnerData.startMilesPerWeek = parseFloat(runnerData.mpw);
  runnerData.raceMiles = parseFloat(runnerData.goalDistance);
  runnerData.longRunDay = parseInt(runnerData.longRun);

  // Time for some calculations!! What Fun!

  //Calculate running days per week from runnerdata:
  for (let i = 0; i < runnerData.days.length; i++) {
    runnerData.days[i] = parseInt(runnerData.days[i]);
  }

  // put runDays in order, ending with their chosen longRunDay.. (make the longRunDay the last day of schedule week.)
  let runDays = runnerData.days;
  runDays.sort();
  // while (runDays[runDays.length - 1] > runnerData.longRunDay) {
  //     runDays.unshift(runDays.pop());
  // }

  while (runDays[runDays.length - 1] > runnerData.longRunDay) {
    runDays[runDays.length - 1] = runDays[runDays.length - 1] - 7;
    runDays.sort();
  }

  logthis("runDays ordered with long run last = " + runDays);
  logthis("\nCalculated Data Using runnerData:");
  logthis("runDays =" + runDays);
  logthis("runDays.length = " + runDays.length);
  // Calculate how many weeks of training:

  // Take off Last 14 days for pre-marathon taper (only 26.2 mile marathons have 2 week taper)
  // milliseconds in one day = 24hrs X 60 minutes X 60 Seconds X 1,000 milliseconds
  let lastRegularTrainingDay =
    new Date(runnerData.raceDate + "T12:00:00").getTime() -
    24 * 60 * 60 * 1000 * 14; //= 14 days
  logthis(
    "lastRegularTrainingDay (before taper) = " +
      new Date(lastRegularTrainingDay).toJSON().substr(0, 10)
  );

  //convert the other date values to time in milliseconds javascript native..
  runnerData.startDate = new Date(runnerData.startDate).getTime();
  logthis(
    "startDate in ms = " +
      runnerData.startDate +
      " = " +
      new Date(runnerData.startDate)
  );

  runnerData.raceDate = new Date(runnerData.raceDate + "T12:00:00").getTime();
  logthis(
    "raceDate in ms = " +
      runnerData.raceDate +
      " = " +
      new Date(runnerData.raceDate)
  );

  //calculate time diff between training start date and last training date
  const timeDifference = lastRegularTrainingDay - runnerData.startDate;
  // calculate the no. of days between two dates by dividing by a day of milliseconds
  const dayDifference = timeDifference / (1000 * 3600 * 24);
  logthis("total days of training time = " + dayDifference);
  // calculate totalweeks to train
  const weeksToTrain = Math.ceil(dayDifference / 7);
  logthis("total weeks of training time = " + weeksToTrain);

  const weeksToIncrementMiles = Math.ceil((dayDifference / 7) * 0.666);
  logthis(
    "total weeks of incrementations (2/3 weeks) = " + weeksToIncrementMiles
  );

  // calculate totalTrainingSessions
  const totalSessions = runDays.length * weeksToTrain;
  logthis("total run sessions (weeks x perweek) = " + totalSessions);

  // figure out if we are going to exceed max miles per week with default weeklyIncrement miles per week increase..********************************************
  // If we exceed peak, then adjust the weeklyIncrement downward to meet peak goal.
  let weeklyIncrement = 3;
  // maxMilesPerWeek limited to 60 if only training 3 days per week.
  let maxMilesPerWeek;
  if (runDays.length < 4) {
    // maxMilesPerWeek limited to 60 if only training 3 days per week.
    maxMilesPerWeek = 60;
  } else {
    maxMilesPerWeek = 65;
  }

  logthis(
    "maxMilesPerWeek Goal is = " +
      maxMilesPerWeek +
      ",THIS schedule will reach: " +
      maxMilesPerWeek * weeksToIncrementMiles +
      runnerData.startMilesPerWeek
  );

  if (
    weeksToIncrementMiles * weeklyIncrement + runnerData.startMilesPerWeek >
    maxMilesPerWeek
  ) {
    // Compute new weeklyIncrement to reach max miles per week in the number of weeks of training.
    weeklyIncrement =
      (maxMilesPerWeek - runnerData.startMilesPerWeek) / weeksToIncrementMiles;
  }

  logthis(
    "weeklyIncrement adjusted down if runner exceeds maxMilesPerWeek = " +
      weeklyIncrement
  );

  const peakMiles =
    weeklyIncrement * weeksToIncrementMiles + runnerData.startMilesPerWeek;
  logthis("The peak miles per week will reach " + peakMiles);

  // Calculate and assign running schedule and percent for each day of run
  if (runDays.length > 6 || runDays.length < 3) {
    logthis(
      "ERROR--- Only " +
        runDays.length +
        " Run Days Chosen.. This Must be between 3 and 6. Continuing with assumed 4 days: Mon, Tue, Wed, Thu, Sat"
    );
    runDays.push(1);
    runDays.push(2);
    runDays.push(4);
    runDays.push(6);
  }

  if (runDays.length === 3) {
    day[0] = {
      percentMilesPerWeek: 25,
      description:
        "Speed Development.  Developing speed will set you up for success on race day.  They serve as both physical and mental conditioning. Speed workouts should be executed at harder effort than race pace."
    };
    day[1] = {
      percentMilesPerWeek: 25,
      description:
        "Easy Effort.  Easy runs should be executed at a relaxed effort where breathing is comfortable.  They will help you recover from your other runs."
    };
    day[2] = {
      percentMilesPerWeek: 50,
      description:
        "Long Run.  Long runs are your most crucial run of the week.  They will help build physical and mental endurance for race day.  Long run efforts should be executed at your targeted race pace or slower."
    };
  }
  if (runDays.length === 4) {
    day[0] = {
      percentMilesPerWeek: 12.5,
      description:
        "Easy Effort.  Easy runs should be executed at a relaxed effort where breathing is comfortable.  They will help you recover from your other runs."
    };
    day[1] = {
      percentMilesPerWeek: 25,
      description:
        "Speed Development.  Developing speed will set you up for success on race day.  They serve as both physical and mental conditioning. Speed workouts should be executed at harder effort than race pace."
    };
    day[2] = {
      percentMilesPerWeek: 12.5,
      description:
        "Hill Workout.  Run for the hills!  Find a hilly route or run hill repeats.  Running hills will pay dividends on race day.  Hill conditioning will make running on a relatively flat course seem easy."
    };
    day[3] = {
      percentMilesPerWeek: 50,
      description:
        "Long Run.  Long runs are your most crucial run of the week.  They will help build physical and mental endurance for race day.  Long run efforts should be executed at your targeted race pace or slower."
    };
  }
  if (runDays.length === 5) {
    day[0] = {
      percentMilesPerWeek: 8.3,
      description:
        "Easy Effort.  Easy runs should be executed at a relaxed effort where breathing is comfortable.  They will help you recover from your other runs."
    };
    day[1] = {
      percentMilesPerWeek: 25,
      description:
        "Speed Development.  Developing speed will set you up for success on race day.  They serve as both physical and mental conditioning. Speed workouts should be executed at harder effort than race pace."
    };
    day[2] = {
      percentMilesPerWeek: 8.4,
      description:
        "Easy Effort.  Easy runs should be executed at a relaxed effort where breathing is comfortable.  They will help you recover from your other runs."
    };
    day[3] = {
      percentMilesPerWeek: 8.3,
      description:
        "Hill Workout.  Run for the hills!  Find a hilly route or run hill repeats.  Running hills will pay dividends on race day.  Hill conditioning will make running on a relatively flat course seem easy."
    };
    day[4] = {
      percentMilesPerWeek: 50,
      description:
        "Long Run.  Long runs are your most crucial run of the week.  They will help build physical and mental endurance for race day.  Long run efforts should be executed at your targeted race pace or slower."
    };
  }
  if (runDays.length === 6) {
    day[0] = {
      percentMilesPerWeek: 6.25,
      description:
        "Easy Effort.  Easy runs should be executed at a relaxed effort where breathing is comfortable.  They will help you recover from your other runs."
    };
    day[1] = {
      percentMilesPerWeek: 6.25,
      description:
        "Speed Development.  Developing speed will set you up for success on race day.  They serve as both physical and mental conditioning. Speed workouts should be executed at harder effort than race pace."
    };
    day[2] = {
      percentMilesPerWeek: 25,
      description:
        "Easy Effort.  Easy runs should be executed at a relaxed effort where breathing is comfortable.  They will help you recover from your other runs."
    };
    day[3] = {
      percentMilesPerWeek: 6.25,
      description:
        "Hill Workout.  Run for the hills!  Find a hilly route or run hill repeats.  Running hills will pay dividends on race day.  Hill conditioning will make running on a relatively flat course seem easy."
    };
    day[4] = {
      percentMilesPerWeek: 6.25,
      description:
        "Easy Effort.  Easy runs should be executed at a relaxed effort where breathing is comfortable.  They will help you recover from your other runs."
    };
    day[5] = {
      percentMilesPerWeek: 50,
      description:
        "Long Run.  Long runs are your most crucial run of the week.  They will help build physical and mental endurance for race day.  Long run efforts should be executed at your targeted race pace or slower."
    };
  }

  // add chosen run days and day names
  dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ];
  for (let i = 0; i < runDays.length; i++) {
    day[i].dayNumber = runDays[i];
    day[i].dayOfWeek = dayNames[runDays[i]];
  }

  logthis("run days (computed from Sunday) array:");
  logthis(day);

  logthis("Last training day=" + new Date(lastRegularTrainingDay));

  //scheduleWeekStart= new Date(scheduleWeekStart).toISOString().substr(0,10)+"T12:00:00";
  let dayOfMilliseconds = 24 * 60 * 60 * 1000; // 24hrs X 60min X 60secs X 1,000 milliseconds  = 1 day.
  let event = [];
  let events = [];
  let weekNumber = 0;
  let weekToIncrementNumber = 0;
  let milesThisWeek = runnerData.startMilesPerWeek;
  let eventCounter = 0;
  let todayNoon = new Date().toISOString().substr(0, 10) + "T12:00:00";
  let scheduleWeekStart = new Date(todayNoon).setDate(
    new Date().getDate() - new Date(todayNoon).getDay() + 1
  );
  logthis(
    "Calendar Calculations start the Sunday prior to training start date = " +
      new Date(scheduleWeekStart)
  );
  let tempEventDate = new Date().getTime();

  // ************************** Start creating Events *********************************************
  // ************************** Start creating Events *********************************************

  while (tempEventDate < runnerData.raceDate) {
    weekMilesAddedUp = -1;
    weekNumber++;

    // for uptick training weeks, calculate new miles per week after incrementing the value of weekToIncrementNumber
    if (weekNumber % 3 > 0) {
      weekToIncrementNumber++;
      milesThisWeek =
        weeklyIncrement * weekToIncrementNumber + runnerData.startMilesPerWeek;
      specialComment = "";
    } else {
      // for every 3rd week, the 'Recovery weeks', Miles drop 15% and we do not increment the weekToIncrementNumber (not an uptick week)
      milesThisWeek = 0.85 * milesThisWeek;
      specialComment = "Recovery Week : ";
    }

    // If any run is over 20 miles, we must redistribute the extra miles onto easier days.

    // create mileTest Array slice in a duplicate of the day array
    let mileTest = day.slice(0);
    // now I loop through the array and add a field to hold the original day order of the array, since I am about to sort by run length percentages
    for (i = 0; i < day.length; i++) {
      mileTest[i].dayorder = i;
    }
    // Sort milesTest array by longest run to shortest, using teh percentMilesPerWeek key
    mileTest.sort((a, b) => a.percentMilesPerWeek - b.percentMilesPerWeek);
    // declare remainder variable for overflow miles
    let remainder = 0;
    //Loop through run, and if any run exceeds 20 miles, spread remainder over the remaining shorter runs
    for (i = mileTest.length - 1; i >= 0; i--) {
      // eslint-disable-next-line prettier/prettier
      logthis("i = " + i + " milesThisWeek = " + milesThisWeek + " mileTest[i].percentMilesPerWeek = " + mileTest[i].percentMilesPerWeek );

      // get normal calculation for this run day
      calcRunByPercent =
        (milesThisWeek * mileTest[i].percentMilesPerWeek) / 100;
      logthis("normal calcRunByPercent = " + calcRunByPercent);
      // add portion of remainder miles by dividing remainder miles by remaining runs (i+1)
      calcRunPlusRemainder = calcRunByPercent + remainder / (i + 1);
      // deduct the same portion of miles from the remainder
      remainder = remainder - remainder / (i + 1);
      logthis(
        "with portion of remainder if applicable =" + calcRunPlusRemainder
      );
      // if THIS run ends up longer than 20 miles, reduce to 20, and toss the rest into remainder variable
      if (calcRunPlusRemainder > 20) {
        // put miles over 20 into remainder
        remainder = calcRunPlusRemainder - 20 + remainder;
        // Since it was over 20, set miles to 20
        calcMilesToRun = 20;
      } else {
        // since calcuRunPlusRemainder was under 20, use it for todays miles to run.
        calcMilesToRun = calcRunPlusRemainder;
      }
      // Reset percentage of week due to change
      mileTest[i].percentMilesPerWeek =
        Math.round((calcMilesToRun / milesThisWeek) * 1000) / 10;
      // set todays calcMilesToRun in the milesTest array for use on event builder
      mileTest[i].calcMilesToRun = calcMilesToRun;

      // eslint-disable-next-line prettier/prettier
      logthis( "for runtest " + i + " (" + mileTest[i].percentMilesPerWeek +"%) the run is " + calcMilesToRun + ". and the remainder is now " + remainder);
    }

    // reSort by original day order so they are called in correct order.
    mileTest.sort((a, b) => a.dayorder - b.dayorder);

    //    logthis(mileTest);

    // Create events for this week
    for (let i = 0; i < runDays.length; i++) {
      // get value of 1st runDays[] and multiply by days, then add to Sunday week start to get first event of week
      //(first event may be negative day to make long run the last day of the weeks events)
      tempEventDate =
        scheduleWeekStart +
        runDays[i] * dayOfMilliseconds +
        7 * weekNumber * dayOfMilliseconds;

      daysTillRaceDay = Math.floor(
        (runnerData.raceDate - tempEventDate) / (24 * 60 * 60 * 1000)
      );

      // if we have entered 2 week taper, drop 25%, then 50%
      if (daysTillRaceDay < 15) {
        // use peakMiles unless its over 40, then use 40.
        if (peakMiles > 40) {
          taperMilesPerWeek = 40;
        } else {
          taperMilesPerWeek = peakMiles;
        }

        specialComment =
          daysTillRaceDay +
          " days til race day. You are in final prep stage : ";
        if (daysTillRaceDay < 8) {
          milesThisWeek = 0.25 * taperMilesPerWeek;
        } else {
          milesThisWeek = 0.5 * taperMilesPerWeek;
        }
      }

      let remainingWeeks = Math.floor(
        (tempEventDate - runnerData.raceDate) / (-1 * 7 * 24 * 60 * 60 * 1000)
      );

      // skip event if it is before runners start date (calculations start the sunday prior to start date).
      // Also skip event if it is less than 2 days prior to race.

      if (
        tempEventDate >= runnerData.startDate &&
        tempEventDate < runnerData.raceDate - 2 * 24 * 60 * 60 * 1000
      ) {
        // create the actual event ****************************************** create the days event *****************************************
        eventCounter++;
        event.number = eventCounter;
        event.date = new Date(tempEventDate);
        event.percentMilesPerWeek = mileTest[i].percentMilesPerWeek;
        event.milesToRunToday = Math.ceil(
          milesThisWeek * (mileTest[i].percentMilesPerWeek / 100)
        );
        event.mileTotalThisWeek = Math.ceil(milesThisWeek);
        // Math.ceil replaced the miles Math.round to nearest 10th of a mile.
        // event.milesToRunToday =
        //   Math.round(
        //     milesThisWeek * (mileTest[i].percentMilesPerWeek / 100) * 10
        //   ) / 10;
        // event.mileTotalThisWeek = Math.round(milesThisWeek * 10) / 10;
        // Create title for event
        event.title =
          event.milesToRunToday +
          " mile run today. " +
          remainingWeeks +
          " weeks til Marathon. " +
          specialComment;
        event.description = specialComment + mileTest[i].description;
        events.push(event);
        event = [];
      }
    }

    eventDay = tempEventDate;
  }

  // Special add on event for Race Day *************
  eventCounter++;
  event.number = eventCounter;
  event.date = new Date(runnerData.raceDate);
  event.percentMilesPerWeek = 100;
  event.milesToRunToday = runnerData.raceMiles;
  event.mileTotalThisWeek = runnerData.raceMiles;
  event.title = "Race Day! Great Job, you are ready for this! Good Luck!";
  event.milesToRunToday = runnerData.raceMiles;
  event.description = "RACE DAY!";
  events.push(event);
  // logthis(event);

  logthis("\nAll Done With Regular Training");

  let eventsArr = [];
  for (let i = 0; i < events.length; i++) {
    let eventObj = {
      number: events[i].number,
      date: events[i].date.toISOString().substr(0, 10),
      percentMilesPerWeek: events[i].percentMilesPerWeek,
      mileTotalThisWeek: events[i].mileTotalThisWeek,
      milesToRunToday: events[i].milesToRunToday,
      title: events[i].title,
      description: events[i].description
    };
    eventsArr.push(eventObj);
  }

  //logthis("\n\nEventArray:\n\n");
  //logthis(events);

  logthis("\n\nEventObject:\n\n");
  logthis(eventsArr);

  return eventsArr;
}