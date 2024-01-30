import { useEffect, useRef, useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import axios from "axios";
import csv from "csvtojson";

const MarkhamPostalCodePrefixes = [
  "L3P",
  "L3R",
  "L3S",
  "L3T",
  "L3X",
  "L3Y",
  "L6B",
  "L6C",
  "L6E",
  "L6G"
];
function App() {
  // const [fileNames, fileNamesSetter] = useState<string[]>([]);
  // const [contents, contentsSetter] = useState<string[]>([]);

  const loadFile = async () => {
    const response = await axios.get("./Children_s_Service.csv", { responseType: 'blob' });
    console.log(response);
    const reader = new FileReader();
    const readAsText = (blob: Blob) =>
      new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsText(blob);
      });

    const text = await readAsText(response.data);
    const data = await csv().fromString(text);
    console.log(data.filter(x => {
      let exists = false;
      MarkhamPostalCodePrefixes.forEach(code => {
        const reg = new RegExp(code);
        if (reg.test(x.POSTAL_CODE)) {
          exists = true;
        }
      });
      return exists && x.TYPE == "Centre Based Child Care" && x.SUBSIDIZED == "Yes";
    }));
  };

  // const loadFiles = async () => {
  //   let tmpFileContents: string[] = [];
  //   for (let i = 0; i < fileNames.length; i++) {
  //     const content = await fs.readFile(`${rootPath}/${fileNames[i]}`);
  //     tmpFileContents.push(content);
  //   };
  //   contentsSetter(tmpFileContents);
  // };

  // const reset = () => {
  //   fileNamesSetter([]);
  //   contentsSetter([]);
  // };
  // useEffect(() => {
  //   if (contents.length > 0) {
  //     contents.forEach(htmlStr => {
  //       const doc = new DOMParser().parseFromString(htmlStr, 'text/html');
  //       console.log(doc.body.querySelector('#page1-div')?.querySelectorAll('p').length);
  //     });
  //   }
  // }, [contents]);
  return (
    <>
      <button onClick={loadFile}>Load File</button>
      {/* <button onClick={loadFiles} disabled={fileNames.length == 0 || contents.length > 0}>Load Files</button> */}
      {/* <button onClick={reset} disabled={fileNames.length == 0 && contents.length == 0}>Reset</button> */}
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
