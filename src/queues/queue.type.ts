import { Attachment, Collection } from 'discord.js';

export enum AppQueues {
  photo = 'photo-gen',
}

export enum PhotoJobNames {
  base = 'create-prompt',
  image = 'image-creating',
  test = 'test',
}

export enum PhotoJobTimeouts {
  base = 20 * 1000,
  image = 2 * 60 * 1000,
}

export type photoBaseJobData = {
  characterHash: string;
  prompt: string;
  hash: string;
};

export type photoImageCreateJobData = photoBaseJobData & {
  content: Collection<string, Attachment>;
};
