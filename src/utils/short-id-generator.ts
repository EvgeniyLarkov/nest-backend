import ShortUniqueId from 'short-unique-id';

function getShortId(length = 10): string {
  const uid = new ShortUniqueId();

  return uid(length);
}

export default getShortId;
