import React, { useState } from "react";

interface Props {
  onDataUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const UploadForm: React.FC<Props> = ({ onDataUpload }) => {
  return (
    <div>
      <input type="file" onChange={onDataUpload} />
    </div>
  );
};

export default UploadForm;
