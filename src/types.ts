export interface Frontmatter {
  [key: string]: unknown;
}

export interface NoteFile {
  absPath: string;
  /** posix-style, relative to the vault root, e.g. "projects/alpha.md" */
  relPath: string;
  /** relPath without the .md extension */
  slug: string;
  /** lowercased basename without extension, used to resolve [[wikilinks]] */
  filenameKey: string;
  frontmatter: Frontmatter;
  title: string;
  titleKey: string;
  bodyMarkdown: string;
  /** frontmatter.type, when it is a string */
  typeName?: string;
  /** true when this note itself defines a type (frontmatter.type === "Type") */
  isTypeDoc: boolean;
}

export interface TypeDef {
  name: string;
  icon?: string;
  color?: string;
  sidebarLabel?: string;
  order: number;
}

export interface RelationshipEdge {
  field: string;
  targetSlug: string;
}

export interface VaultIndex {
  notes: Map<string, NoteFile>;
  /** filenameKey/titleKey (lowercased) -> slug, for wikilink resolution */
  byKey: Map<string, string>;
  /** type name -> its definition */
  types: Map<string, TypeDef>;
  /** slug -> outbound relationship edges declared in frontmatter */
  relationships: Map<string, RelationshipEdge[]>;
  /** slug -> set of slugs whose body links to it */
  backlinks: Map<string, Set<string>>;
  /** slugs that pass the publish filter */
  published: Set<string>;
}
