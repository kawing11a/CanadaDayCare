import { useEffect, useMemo, useRef, useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import axios from "axios";
import csv from "csvtojson";
import { Box, Button, Link, List, ListItemButton, ListItemText, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridValueGetterParams } from "@mui/x-data-grid";

interface DayCare {
  X: string,
  Y: string;
  OBJECTID: string;
  PNT_GIS_ID: string;
  NAME: string;
  ORG_NAME: string;
  CATEGORY: string;
  POSTAL_CODE: string;
  PHONE_NO: string;
  PHONE_EXT: string;
  MAIN_INTERSECTION: string;
  TYPE: string;
  SUBSIDIZED: string;
  CWELCC: string;
  PROVIDDISP: string;
  FULL_ADDRESS: string;
  UNIT_NUMBER: string;
  COMMUNITY: string;
  MUNICIPALITY: string;
}

const PostalMapURLMap = new Map<string, string>([
  ["L3P", "!1m18!1m12!1m3!1d46015.5140481219!2d-79.30799702131985!3d43.87718086966684!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d4d63fcdcb8233%3A0xa70e1348265e27ea!2zTDNQ5Yqg5ou_5aSn5a6J5aSn55Wl5pa85Lq65p2R!5e0!3m2!1szh-TW!2shk!4v1706714622439!5m2!1szh-TW!2shk"],
  ["L3R", "!1m18!1m12!1m3!1d46035.92294849518!2d-79.36921957163676!3d43.850746547378996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d4d45a4625b9b9%3A0xe8b47ec07acebc29!2zTDNS5Yqg5ou_5aSn5a6J5aSn55Wl6JCs6Yym!5e0!3m2!1szh-TW!2shk!4v1706714439296!5m2!1szh-TW!2shk"],
  ["L3S", "!1m18!1m12!1m3!1d46038.05836290634!2d-79.30699597166988!3d43.847979950278926!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d4d6f2ec5c98dd%3A0x24acc581190c7292!2zTDNT5Yqg5ou_5aSn5a6J5aSn55Wl6JCs6Yym!5e0!3m2!1szh-TW!2shk!4v1706714692354!5m2!1szh-TW!2shk"],
  ["L3T", "!1m18!1m12!1m3!1d46057.68998098426!2d-79.43169952197466!3d43.82253912694237!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882b2caf9968186b%3A0xb42f6e2abac4f83f!2zTDNU5Yqg5ou_5aSn5a6J5aSn55Wl5rmv5bGx!5e0!3m2!1szh-TW!2shk!4v1706714733367!5m2!1szh-TW!2shk"],
  ["L6B", "!1m18!1m12!1m3!1d46016.64278526718!2d-79.2696305213374!3d43.87571922119934!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d4d7c6ac4cdaf5%3A0x3ea09da35c870002!2zTDZC5Yqg5ou_5aSn5a6J5aSn55Wl6JCs6Yym!5e0!3m2!1szh-TW!2shk!4v1706714788871!5m2!1szh-TW!2shk"],
  ["L6C", "!1m18!1m12!1m3!1d46009.92911361501!2d-79.37564402123316!3d43.88441246208448!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d4d59e3a837ba3%3A0x89e6bc8e7fc4b40f!2zTDZD5Yqg5ou_5aSn5a6J5aSn55Wl6JCs6Yym!5e0!3m2!1szh-TW!2shk!4v1706714802573!5m2!1szh-TW!2shk"],
  ["L6E", "!1m18!1m12!1m3!1d22999.144119851924!2d-79.28687801307292!3d43.89948247308988!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d529dde756aa5b%3A0x47329b06b334e54!2zTDZF5Yqg5ou_5aSn5a6J5aSn55Wl6JCs6Yym!5e0!3m2!1szh-TW!2shk!4v1706714815843!5m2!1szh-TW!2shk"],
  ["L6G", "!1m18!1m12!1m3!1d23020.35781734219!2d-79.35149051323636!3d43.84453705175254!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d4d45e6adf8e41%3A0xa50f9d3e4b4bed62!2zTDZH5Yqg5ou_5aSn5a6J5aSn55Wl6JCs6Yym!5e0!3m2!1szh-TW!2shk!4v1706714831385!5m2!1szh-TW!2shk"]
]);

const MarkhamPostalCodePrefixes = [
  "L3P",
  "L3R",
  "L3S",
  "L3T",
  "L6B",
  "L6C",
  "L6E",
];
function App() {
  // const [fileNames, fileNamesSetter] = useState<string[]>([]);
  // const [contents, contentsSetter] = useState<string[]>([]);
  const [activePostalCode, activePostalCodeSetter] = useState<string>("");
  const [dayCareList, dayCareListSetter] = useState<DayCare[]>([]);

  const mountEffect = () => {
    loadFile();
  };

  useEffect(mountEffect, []);

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
    const data: DayCare[] = await csv().fromString(text);
    dayCareListSetter(data.filter(x => {
      let exists = false;
      MarkhamPostalCodePrefixes.forEach(code => {
        const reg = new RegExp(code);
        if (reg.test(x.POSTAL_CODE)) {
          exists = true;
        }
      });
      return exists && x.TYPE == "Centre Based Child Care" && x.SUBSIDIZED == "Yes" && x.CWELCC == "Yes";
    }));
  };
  console.log(dayCareList);

  const columnConfig = useMemo<GridColDef[]>(() => [
    {
      field: 'NAME',
      headerName: 'Name',
      valueGetter: (params: GridValueGetterParams<DayCare, string>) => {
        return `${params.value} ${!!params.row.ORG_NAME ? `(${params.row.ORG_NAME})` : ''}`;
      },
      flex: 1,
    },
    {
      field: 'POSTAL_CODE',
      headerName: 'Postal Code',
    },
    {
      field: 'PHONE_NO',
      headerName: 'Phone',
      valueGetter: (params: GridValueGetterParams<DayCare, string>) => {
        return `${params.value} ${!!params.row.PHONE_EXT ? `(${params.row.PHONE_EXT})` : ''}`;
      },
      flex: 1,
    },
    {
      field: 'FULL_ADDRESS',
      headerName: 'FULL_ADDRESS',
      flex: 1,
    },
    {
      field: 'UNIT_NUMBER',
      headerName: 'UNIT_NUMBER',
      flex: 1,
    },
  ], []);
  return (
    <>
      <Box sx={{ display: 'flex', height: '100%', width: '100%' }}>
        <Box sx={{ width: '100%', maxWidth: 60, bgcolor: 'background.paper', marginX: 1, }}>
          <List component="nav" aria-label="main mailbox folders">
            {MarkhamPostalCodePrefixes.map(code => (
              <>
                <ListItemButton
                  selected={activePostalCode === code}
                  onClick={(_) => activePostalCodeSetter(code)}
                >
                  <ListItemText primary={code} />
                </ListItemButton>
              </>
            ))}
          </List>
        </Box>
        <Box sx={{ display: 'block', width: '100%', height: '100%', bgcolor: 'background.paper', marginX: 1 }}>
          <Typography><Link target="_blank" href={`https://postal-codes.cybo.com/canada/${activePostalCode}_markham-ontario/`}>Population</Link></Typography>
          <iframe src={`https://www.google.com/maps/embed?pb=${PostalMapURLMap.get(activePostalCode)}`} width="600" height="450" style={{ border: '1px solid' }} allowFullScreen={false} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
          <DataGrid
            getRowId={x => x.OBJECTID}
            rows={dayCareList.filter(x => (new RegExp(activePostalCode).test(x.POSTAL_CODE)))}
            columns={columnConfig}
            pagination
          />
        </Box>
      </Box>
    </>
  );
}

export default App;
