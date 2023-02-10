import React, { useEffect, useState, useRef } from 'react'

export default function UploadForm() {
    const [fileContents, setFileContents] = useState(null);
    const [blocks, setBlocks] = useState([]);
    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        let data = JSON.parse(e.target.result).data;
        setFileContents(data[0].image);
        //const fileData = JSON.parse(event.target.result);
        setBlocks(data);
      };
      reader.readAsText(file);
    };
  
return (
    <div>
        <input type="file" onChange={handleFileUpload} />
        {fileContents && <pre>{fileContents}</pre>}  
    </div>
    );
};