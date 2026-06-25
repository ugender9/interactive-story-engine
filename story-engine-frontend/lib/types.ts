export interface Choice {
  label: string;
  next_node: string;
}

export interface StoryNode {
  node_id: string;
  type: "scene" | "branch";
  text: string;
  choices: Choice[];
}

export interface StoryBible {
  characters: { name: string; description: string }[];
  setting: string;
  tone: string;
  world_rules: string[];
}

export interface StoryGraph {
  story_id: string;
  story_bible: StoryBible;
  nodes: StoryNode[];
}

export interface IngestResponse {
  story_id: string;
  message: string;
}

export interface StatusResponse {
  story_id: string;
  status: "processing" | "ready" | "failed";
  error?: string;
}
