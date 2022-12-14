export const getProbabilityBasedKey = <T extends Record<string, number>>(
  probabilities: T,
): keyof T => {
  const totalProbability = Object.values(probabilities).reduce(
    (acc, cur) => acc + cur,
    0,
  );
  const randomNumber = Math.random() * totalProbability;

  let cumulativeProbability = 0;
  for (const [key, value] of Object.entries(probabilities)) {
    cumulativeProbability += value;
    if (randomNumber < cumulativeProbability) {
      return key;
    }
  }

  return undefined;
};

export const getProbabilityBasedKeys = <T extends Record<string, number>>(
  events: T,
): Array<keyof T> => {
  // Calculate the total probability of all events occurring
  const totalProbability = Object.values(events).reduce(
    (acc, cur) => acc + cur,
    0,
  );

  // Calculate the maximum number of events to return, which is less than 50% of the total number of events
  const maxEvents = Math.floor(Object.keys(events).length / 2);

  // Generate a random number of events to return, between 1 and the maximum number
  const randomNumberOfEvents = Math.floor(Math.random() * maxEvents) + 1;

  const chosenEvents: Array<keyof T> = [];

  while (chosenEvents.length < randomNumberOfEvents) {
    const randomNumber = Math.random() * totalProbability;

    let cumulativeProbability = 0;
    for (const [key, value] of Object.entries(events)) {
      cumulativeProbability += value;
      if (randomNumber < cumulativeProbability) {
        if (!chosenEvents.some((event) => event === key)) {
          chosenEvents.push(key);
        }
        break;
      }
    }
  }

  return chosenEvents;
};
