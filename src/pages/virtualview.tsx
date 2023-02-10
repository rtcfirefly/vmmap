import React, { useEffect, useState, useRef } from "react";
interface Props {
  virtualAddressSpace: any;
}
export default function VirtualView(props: any) {
  const { virtualAddressSpace } = props;
  const [zoom, setZoom] = useState(114);
  const [hoverContents, setHoverContents] = useState({block:{}});

  const [innerWidth, setInnerWidth] = useState(0);
  const [blocks_to_render, setBlocksToRender] = 
    useState<Array<{
      width: number;
      height: number;
      color: string;
      image: any;
      block: any;
    }>>([]);
  const parentDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function calculateBlocks() {
      const totalAddressSpace = 0xffffffff + 1; // use round numbers

      let blocks = [];
      let start = 0;
      let blocks_to_render = [];
      for (let i = 0; i < virtualAddressSpace.length; i++) {
        if (start < virtualAddressSpace[i].startAddress) {
          blocks.push({
            image: "Free Space",
            startAddress: start,
            endAddress: virtualAddressSpace[i].startAddress,
          });
        }
        blocks.push(virtualAddressSpace[i]);
        start = virtualAddressSpace[i].endAddress;
      }
      /*if ( start < totalAddressSpace) {
      blocks.push({
        image: "Free Space",
        startAddress: start,
        endAddress: totalAddressSpace
      });
  }*/
      // vvar (Virtual Variable) is a region of virtual memory that is used to store per-cpu variables and other miscellaneous kernel data structures that are required to be accessible at a fixed virtual address.
      // vsdo (Virtual System Data Objects) is a region of virtual memory that is used to store system-level data objects that need to be shared across all tasks, including the system call table, the idt (Interrupt Descriptor Table), and other similar data structures.
      type ColorLookup = Record<string, string>;
      const colorLookup:ColorLookup = {
        "Free Space": "grey",
        "[stack]": "rgba(255,192,130,255)",
        "[heap]": "rgba(255,150,102,255)",
        "[vdso]": "rgba(210,160,159,255)",
        "[vvar]": "rgba(221,238,254,255)",
      };

      const pageWidth = innerWidth - 1; // avoid the edge by 1px
      let widthRemaining = pageWidth;
      for (let block of blocks) {
        const calculateWidth = (startAddress: number, endAddress: number) => {
          const width =
            500000 * ((endAddress - startAddress) / totalAddressSpace) * 100;
          return Math.floor(width);
        };
        let blockWidth =
          calculateWidth(block.startAddress, block.endAddress) * (zoom / 100);
        // create the initial block to
        // fill the remainder of the screen of just the block width
        let blockImage:string = block.image;
        let color = colorLookup.hasOwnProperty(blockImage) ? colorLookup[blockImage] : "rgba(211,160,255,255)"; //"rgba(177,214,255,255)";
        let b = {
          width: Math.min(widthRemaining, blockWidth),
          height: 20 * (zoom / 100),
          color: color,
          image: block.image,
          block: block,
        };

        blockWidth -= b.width;
        widthRemaining -= b.width;

        blocks_to_render.push(b);
        if (widthRemaining <= 0) {
          widthRemaining = pageWidth;
        }

        if (blockWidth >= pageWidth) {
          let height;
          //if (block.image == "Free Space") {
          height = 20 * (zoom / 100);
          //} else {
          //height = Math.floor(blockWidth / pageWidth) * 20 * (zoom / 100);
          //}
          let b = {
            width: pageWidth,
            height: height,
            color: color,
            image: block.image,
            dashed: true,
            block: block,
          };
          blocks_to_render.push(b);
          blockWidth -= pageWidth * Math.floor(blockWidth / pageWidth);
        }

        if (blockWidth >= pageWidth) {
          console.log("WTF");
        }
        if (blockWidth > 0) {
          let b = {
            width: blockWidth,
            height: 20 * (zoom / 100),
            color: color,
            image: block.image,
            block: block,
          };

          widthRemaining -= b.width;
          blocks_to_render.push(b);
        }
      }
      setBlocksToRender(blocks_to_render);
    }

    if (parentDivRef && parentDivRef.current) {
      setInnerWidth(parentDivRef.current.offsetWidth);
      window.addEventListener("resize", () => {
        if (parentDivRef && parentDivRef.current) {
          setInnerWidth(parentDivRef.current.offsetWidth);
        }
      });
    }
    calculateBlocks();
  }, [zoom, blocks_to_render, setInnerWidth, innerWidth, virtualAddressSpace]);

  if (!virtualAddressSpace) {
    return <div key="empty" />;
  }

  const handleZoomChange = (event:any) => {
    setZoom(event.target.value);
  };

  function handleMouseMove(event:any) {
    const hoveredDiv = event.target;
    const parent = hoveredDiv.parentNode;
    const divs = Array.from(parent.childNodes);
    const index = divs.indexOf(hoveredDiv);
    setHoverContents(blocks_to_render[index]);

    //console.log(`The index of the hovered div is: ${index}`);
  }

  function renderBlock(block: any, index: number) {
    let border = block.dashed
      ? "inset 0 0 10px 2px rgba(0, 0, 0, 0.2),  0 0 10px 5px rgba(0, 0, 0, 0.05)"
      : "0px 0px 0px 1px black inset";
    let brightness = hoverContents.block == block.block ? 1.09 : 1;
    let ret = (
      <div
        className="memory-block"
        key={index}
        onMouseMove={handleMouseMove}
        style={{
          backgroundColor: block.color,
          width: block.width,
          height: block.height,
          display: "inline-block",
          boxShadow: border,
          cursor: "pointer",
          filter: `brightness(${brightness})`,
        }}
      ></div>
    );
    return ret;
  }

  return (
    <div
      className="virtual-view-container"
      style={
        {
          //border: '1px solid black'
        }
      }
    >
      <div className="test">Zoom i: {zoom}</div>
      <div className="test">innerWidth is: {innerWidth}</div>
      <div className="zoom-slider">
        <input
          type="range"
          min="10"
          max="200"
          value={zoom}
          //style={{ transform: 'rotate(-90deg)', width: '200px' }}
          onChange={handleZoomChange}
        />
      </div>
      <div
        className="virtual-view"
        ref={parentDivRef}
        style={{ display: "flex", flexWrap: "wrap" }}
      >
        {blocks_to_render.map((block, index) => renderBlock(block, index))}
      </div>
      <div
        style={{
          position: "fixed",
          bottom: "0",
          left: "0",
          width: "100%",
          backgroundColor: "white",
          padding: "10px",
          textAlign: "center",
        }}
      >
        hoverContents - {JSON.stringify(hoverContents)}
      </div>
    </div>
  );
}
