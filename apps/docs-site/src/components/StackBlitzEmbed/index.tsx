import styles from './StackBlitzEmbed.module.css';

export type StackBlitzEmbedProps = {
  /** examples/<id> — must match a real directory in this repo. */
  id: string;
  /** File to open in the embed by default. Defaults to 'src/App.tsx'. */
  file?: string;
  /** Iframe height in pixels. Defaults to 600. */
  height?: number;
  /** StackBlitz UI theme. Defaults to 'dark'. */
  theme?: 'dark' | 'light';
};

const REPO_PATH = 'jiji-hoon96/kalyx/tree/main/examples';

export default function StackBlitzEmbed({
  id,
  file = 'src/App.tsx',
  height = 600,
  theme = 'dark',
}: StackBlitzEmbedProps) {
  const embedSrc = `https://stackblitz.com/github/${REPO_PATH}/${id}?embed=1&file=${file}&hideExplorer=1&theme=${theme}`;
  const fullHref = `https://stackblitz.com/github/${REPO_PATH}/${id}`;

  return (
    <div className={styles.wrapper}>
      <iframe
        className={styles.iframe}
        src={embedSrc}
        title={`Kalyx example: ${id}`}
        loading="lazy"
        height={height}
      />
      <a
        className={styles.openLink}
        href={fullHref}
        target="_blank"
        rel="noopener noreferrer">
        Open in StackBlitz ↗
      </a>
    </div>
  );
}
