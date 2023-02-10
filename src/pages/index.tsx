import React, { useEffect, useState, useRef } from "react";
import UploadForm from "./uploadform";
import VirtualView from "./virtualview";

export default function Index() {
  const [blockData, setBlocks] = useState([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files![0];
    const reader = new FileReader();
    reader.onload = (e: any) => {
      let data = JSON.parse(e.target.result).data;
      //setFileContents(data[0].image);
      //const fileData = JSON.parse(event.target.result);
      setBlocks(data);
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <UploadForm onDataUpload={handleFileUpload} />
      {blockData && <VirtualView virtualAddressSpace={blockData} />}
    </div>
  );
}
