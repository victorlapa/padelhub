interface SpacerProps {
  height: number | string;
}

export default function Spacer({ height }: SpacerProps) {
  const heightValue = typeof height === 'number' ? `${height}px` : height;

  return <div style={{ height: heightValue }} />;
}