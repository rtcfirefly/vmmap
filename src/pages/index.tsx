//import Head from 'next/head'
//import Image from 'next/image'
//import { Inter } from '@next/font/google'
// import styles from '@/styles/Home.module.css'

//const inter = Inter({ subsets: ['latin'] })

import React, { useEffect, useState, useRef } from 'react'
import UploadFrom from './uploadform'
export default function Index() {
  return (
    <div>
      <UploadForm/> 
    </div>
  );
};

function VirtualView(props){
  
  const { virtualAddressSpace } = props;
  if (virtualAddressSpace == []){
    return;
  }
  const [ zoom, setZoom] = useState(114);
  const [innerWidth, setInnerWidth] = useState(0);
  const [blocks_to_render, setBlocksToRender] = useState([]);
  const parentDivRef = useRef(null);
  const totalAddressSpace = 0xffffffff+1; // use round numbers
  let virtualAddressSpace2 = [
    {
      region: "Stack",
      color: "blue",
      startAddress: "0x00001000",
      endAddress: "0x0006000",
      description: "Thread stack space"
    },
    {
      region: "Heap",
      color: "green",
      startAddress: "0x00010000",
      endAddress: "0x00029000",
      description: "Dynamic memory allocation"
    },
    {
      region: "Image",
      color: "red",
      startAddress: "0x0030000",
      endAddress: "0x0040000",
      description: "DLL"
    }
  ]

  useEffect(() => {

    
    setInnerWidth(parentDivRef.current.offsetWidth);
    window.addEventListener("resize", () => {
      setInnerWidth(parentDivRef.current.offsetWidth);
    });
    calculateBlocks();
   
  }, [zoom, blocks_to_render]);



  const calculateWidth = (startAddress, endAddress) => {

    const width = 500000 * ((endAddress - startAddress) / totalAddressSpace) * 100;
    return Math.floor(width);
  }

  const handleZoomChange = event => {
    setZoom(event.target.value);
    
  };



  //onZoomChange = (event) => {
  //  this.setState({ zoom: event.target.value });
  //};
  function calculateBlocks(){
    let blocks = [];
    let start = 0;
    let blocks_to_render = [];
    for (let i = 0; i < virtualAddressSpace.length; i++) {
      if (start < virtualAddressSpace[i].startAddress) {
        /*blocks.push({
          region: "Free Space",
          color: "pink",
          startAddress: start,
          endAddress: virtualAddressSpace[i].startAddress
        });*/
      }
      blocks.push(virtualAddressSpace[i]);
      start = virtualAddressSpace[i].endAddress;
    }
    /*if ( start < totalAddressSpace) {
      blocks.push({
        region: "Free Space",
        color: "teal",
        startAddress: start,
        endAddress: totalAddressSpace
      });
  }*/

    
    const pageWidth = innerWidth-1; // avoid the edge by 1px
    let widthRemaining = pageWidth;
    for (let block of blocks) {
      let blockWidth =
        calculateWidth(block.startAddress, block.endAddress) *
        (zoom / 100);

      // create the initial block to
      // fill the remainder of the screen of just the block width
      
      let b = {};
      b.width = Math.min(widthRemaining, blockWidth);
      b.height = 20 * (zoom / 100);
      b.color = block.color;
      b.image = block.image;
      blockWidth -= b.width;
      widthRemaining -= b.width;
      
      blocks_to_render.push(b);
      if (widthRemaining <= 0) {
        widthRemaining = pageWidth;
      }

      if (blockWidth >= pageWidth) {
        let b = {}
        b.width = pageWidth;
        b.height =
          Math.floor(blockWidth / pageWidth) * 20 * (zoom / 100);
        b.color = block.color;
        b.image = block.image;
        blocks_to_render.push(b);
        blockWidth -= pageWidth * Math.floor(blockWidth / pageWidth);
    }

    if (blockWidth >= pageWidth) {
      console.log("WTF");
    }
    if (blockWidth > 0) {
      let b = {}
      b.width = blockWidth;
      b.height = 20 * (zoom / 100);
      b.color = block.color;
      b.image = block.image;
      widthRemaining -= b.width;
      blocks_to_render.push(b);
    }
  }
  setBlocksToRender(blocks_to_render);
  }

  if (blocks_to_render == []){
    calculateBlocks();
  }

  function handleMouseMove(event){
    const hoveredDiv = event.target;
    const parent = hoveredDiv.parentNode;
    const divs = Array.from(parent.childNodes);
    const index = divs.indexOf(hoveredDiv);

    console.log(`The index of the hovered div is: ${index}`);
  };

  function renderBlock(zoom, block, index) {
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
          boxShadow: "0px 0px 0px 1px black inset"
        }}
      >
        <pre>{block.image}</pre>
      </div>
    );
    return ret;
  }
  //calculateBlocks();

  
  return (
    <div 
      className="virtual-view-container"
      style={{  
      //border: '1px solid black'
    }}
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
        className="virtual-view"  ref={parentDivRef}
        style={{ display: "flex", flexWrap: "wrap"}}>
        {blocks_to_render.map((block, index) =>
          renderBlock(zoom, block, index)
        )}
      </div>
      <div style={{ 
          position: "fixed",
          bottom: "0",
          left: "0",
          width: "100%",
          backgroundColor: "white",
          padding: "10px",
          textAlign: "center"
          }}>
            hello
          {/*this.state.currentHover*/}
        </div>
    </div>
  );
};