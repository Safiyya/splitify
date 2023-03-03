import { Cluster, Track } from "@/types";
import cluster from "cluster";
import { useMemo } from "react";
import ForceGraph2D from "react-force-graph-2d";

interface GraphProps {
  clusters?: Cluster[];
}

type Node = {
  id: string;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  fx?: number;
  fy?: number;
  group: number;
  track: Track;
};

const Graph: React.FunctionComponent<GraphProps> = ({ clusters }) => {
  const allImages: Map<string, HTMLImageElement> = useMemo(() => {
    const images = clusters
      // TODO : Optimize to take smaller image of the list
      ?.map((c) => c.tracks.map((t) => t.album.images[0].url))
      .flat()
      .map((src) => {
        const i = new Image();
        i.src = src;
        return [src, i] as [string, HTMLImageElement];
      });
    return new Map(images);
  }, [clusters]);

  console.log({ allImages });

  const data = useMemo(() => {
    if (!clusters) return { nodes: [], links: [] };
    const nodes = clusters
      .map((cluster, index) =>
        cluster.tracks.map((t) => ({
          id: `${t.name}`,
          group: index,
          track: t,
        }))
      )
      .flat();

    const links = clusters
      .map((cluster) =>
        cluster.tracks.map((source) => {
          const targets = cluster.tracks.filter(
            (track) => track.id !== source.id
          );

          return targets.map((target) => ({
            source: source.name,
            target: target.name,
            value: 1,
          }));
        })
      )
      .flat(3);

    console.log({ nodes });
    return { nodes, links };
  }, [clusters]);

  const renderNode = (
    node: Node,
    ctx: CanvasRenderingContext2D,
    globalScale: number
  ) => {
    const NODE_R = 10;
    const fontSize = 16 / globalScale;
    ctx.font = `${fontSize}px Sans-Serif`;
    const textWidth = ctx.measureText(node.id).width;
    const bckgDimensions = [textWidth, fontSize].map((n) => n + fontSize * 0.2); // some padding

    ctx.beginPath();
    ctx.arc(node.x, node.y, NODE_R, 0, 2 * Math.PI, false);
    ctx.fillStyle = "#ea5400";

    ctx.fill();

    ctx.fillStyle = "#25b363";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(`Clustered ${node.id}`, node.x, node.y + 10);

    const image = allImages.get(node.track.album.images[0].url) || new Image();
    image.onload = () => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(NODE_R, NODE_R, NODE_R, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();

      console.log("draw now");
      ctx.drawImage(image, 0, 0, NODE_R * 2, NODE_R * 2);

      ctx.beginPath();
      ctx.arc(0, 0, NODE_R, 0, Math.PI * 2, true);
      ctx.clip();
      ctx.closePath();
      ctx.restore();
    };
    // image.src = allImages.get(node.track.album.images[0].url) || "";

    node.__bckgDimensions = bckgDimensions;
  };

  return (
    <ForceGraph2D
      width={window.innerWidth * 0.8}
      height={900}
      graphData={data}
      nodeAutoColorBy="group"
      nodeColor="red"
      nodeCanvasObject={renderNode}
      //   nodeCanvasObject={(node, ctx, globalScale) => {
      //     const label = node.id?.toString() || "";
      //     const fontSize = 16 / globalScale;
      //     ctx.font = `${fontSize}px Sans-Serif`;
      //     const textWidth = ctx.measureText(label).width;
      //     const bckgDimensions = [textWidth, fontSize].map(
      //       (n) => n + fontSize * 0.2
      //     ); // some padding

      //     ctx.fillStyle = "transparent";
      //     ctx.fillRect(
      //       (node.x || 0) - bckgDimensions[0] / 2,
      //       (node.y || 0) - bckgDimensions[1] / 2,
      //       bckgDimensions[0],
      //       bckgDimensions[1]
      //     );

      //     ctx.textAlign = "center";
      //     ctx.textBaseline = "middle";
      //     ctx.fillStyle = "white";
      //     ctx.fillText(`${node.id}`, node.x || 0, node.y || 0);

      //     node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
      //   }}
      nodePointerAreaPaint={(node, color, ctx) => {
        ctx.fillStyle = color;
        const bckgDimensions = node.__bckgDimensions;
        bckgDimensions &&
          ctx.fillRect(
            (node.x || 0) - bckgDimensions[0] / 2,
            (node.y || 0) - bckgDimensions[1] / 2,
            bckgDimensions[0],
            bckgDimensions[1]
          );
      }}
    />
  );
};

export default Graph;
