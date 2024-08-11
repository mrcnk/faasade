export type GistFile = {
	content: string;
	language: "JavaScript" | "TypeScript";
};

type Files = Record<string, GistFile>;

export type GitHubGist = {
	files: Files;
};
