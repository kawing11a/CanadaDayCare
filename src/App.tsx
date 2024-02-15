import { useEffect, useMemo, useRef, useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import axios from "axios";
import csv from "csvtojson";
import { Box, Button, Link, List, ListItemButton, ListItemText, Typography } from "@mui/material";
import { DataGrid, GridCallbackDetails, GridCellParams, GridColDef, GridRowSelectionModel, GridValueGetterParams } from "@mui/x-data-grid";
import fs from "vite-plugin-fs/browser";

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
  URL?: string;
}

const DayCareWebsiteMap = new Map<string, string>([
  ["ACE MONTESSORI", "https://www.acemontessori.ca/"],
  ["Upper Canada Child Care at Aldergrove PS", "https://uppercanadachildcare.com/locations/aldergrove-public-school/"],
  ["All About Kids Day Care", "https://allaboutkids.ca/"],
  ["All About Kids - Cornell 2", "https://allaboutkids.ca/locations/cornell-2/"],
  ["All Smiles Childcare Centre", "https://www.allsmileschildcare.ca/"],
  ["All Saints' Montessori School", "https://allsaintsmontessori.com/"],
  ["Armadale Child Care Centre", "https://www.armadalechildcare.com/"],
  ["Upper Canada Child Care at Ashton Meadows PS", "https://uppercanadachildcare.com/locations/ashton-meadows-public-school/"],
  ["Upper Canada Child Care at Baythorn PS", "https://uppercanadachildcare.com/locations/baythorn-public-school/"],
  ["Bayview Fairways B & A School Program", "https://www.bayviewfairwayschildcare.com/"],
  ["Bayview Glen Before & After School Program", "https://www.bayviewglenchildcare.com/"],
  ["Beckenridge Discovery Preschool", "https://www.beckenridgediscoverypreschool.com/"],
  ["Between Friends", "https://www.betweenfriendschildcare.com/"],
  ["Upper Canada Child Care at St. John XXIII CES", "https://uppercanadachildcare.com/locations/st-john-xxiii-catholic-elementary-school/"],
  ["Blossoms", "https://www.blossomschildcare.com/"],
  ["Boxwood School Age Program", "https://www.boxwoodchildcare.com/"],
  ["Brimley-Steeles Montessori School", "https://www.brimleysteelesmontessori.com/"],
  ["Upper Canada Child Care at Buttonville PS", "https://uppercanadachildcare.com/locations/buttonville-public-school/"],
  ["Castlemore School Age Program", "https://www.castlemorechildcare.com/"],
  ["Central Park Child Care Centre", "https://www.centralparkchildcare.com/"],
  ["Chapel Place Daycare Centre", "https://www.chapelplacedaycare.com/"],
  ["Coledale Junior Y", "https://ymcagta.org/find-a-y/coledale-child-care-centre"],
  ["Upper Canada Child Care at Cornell Village PS", "https://uppercanadachildcare.com/locations/cornell-village-public-school/"],
  ["Upper Canada Child Care at David Suzuki PS", "https://uppercanadachildcare.com/locations/david-suzuki-public-school/"],
  ["Discovery Preschool On 7 Inc.", "https://www.discoverypreschool.ca/"],
  ["Upper Canada Child Care at Donald Cousens PS", "https://uppercanadachildcare.com/locations/donald-cousens-public-school/"],
  ["Early Blooms Montessori", "https://www.earlyblooms.ca/"],
  ["Upper Canada Child Care at Ellen Fairclough PS", "https://uppercanadachildcare.com/locations/ellen-fairclough-public-school/"],
  ["Evergreen Daycare Centre", "https://evergreendaycarecentre.com/"],
  ["Cedarwood Before & After School Program", "https://www.cedarwoodchildcare.com/"],
  ["Upper Canada Child Care at Fred Varley PS", "https://uppercanadachildcare.com/locations/fred-varley-public-school/"],
  ["Friendships", "https://www.friendshipschildcare.com/"],
  ["German Mills Children's Academy", "https://www.germanmillschildrensacademy.com/"],
  ["Greensborough Before and After School Program", "https://www.greensboroughchildcare.com/"],
  ["Hagerman House Early Learning and Family Centre", "https://www.hagermanhouse.com/"],
  ["Henderson Ave Kids Club", "https://www.hendersonavekidsclub.com/"],
  ["Heritage Discovery Pre-School Inc.", "https://www.heritagediscoverypreschool.com/"],
  ["Highgate School-Age Childcare", "https://www.highgatechildcare.com/"],
  ["Wilclay Childcare Centre", "https://www.wilclaychildcare.com/"],
  ["Inspire Montessori School Corp", "https://www.inspiremontessori.ca/"],
  ["Inventiveminds Child, Youth Family Services", "https://www.inventiveminds.ca/"],
  ["James Robinson School Age Program", "https://www.jamesrobinsonchildcare.com/"],
  ["Upper Canada Child Care at John McCrae PS", "https://uppercanadachildcare.com/locations/john-mccrae-public-school/"],
  ["Johnsview School-Age Program", "https://www.johnsviewchildcare.com/"],
  ["Kateri Tekakwitha Before & After School Program", "https://www.kateritekakwithachildcare.com/"],
  ["Kids Connection @ All Saints", "https://www.kidsconnectionchildcare.com/"],
  ["Kids Connection @ Beckett Farm", "https://www.kidsconnectionchildcare.com/"],
  ["La Garderie Des Moussaillons", "https://www.lagarderiedesmoussaillons.com/"],
  ["Le Club Child Care - School Age Child Care - Woodland", "https://www.leclubchildcare.com/"],
  ["Le Club - Roy H Crosby", "https://www.leclubchildcare.com/"],
  ["Learning Jungle School - Greensborough Campus", "https://www.learningjungle.com/greensborough/"],
  ["Legacy YMCA Child Care", "https://ymcagta.org/find-a-y/legacy-child-care-centre"],
  ["Upper Canada Child Care at Lincoln Alexander PS", "https://uppercanadachildcare.com/locations/lincoln-alexander-public-school/"],
  ["Upper Canada Child Care at Little Rouge PS", "https://uppercanadachildcare.com/locations/little-rouge-public-school/"],
  ["Little Steps Early Learning and Child Care Centre", "https://www.littlestepschildcare.ca/"],
  ["Little Miracles Child Care and Learning Centre", "https://www.littlemiracleschildcare.ca/"],
  ["Love n' Learn Childcare", "https://www.lovenlearnchildcare.com/"],
  ["Macklin House Daycare Centre", "https://www.macklinhousedaycare.com/"],
  ["Macklin House Kidzone - Coppard Glen", "https://www.macklinhousekidzone.com/"],
  ["Macklin House Kidzone - Sam Chapman", "https://www.macklinhousekidzone.com/"],
  ["Maple Seed Montessori and Child Care", "https://www.mapleseedmontessori.com/"],
  ["Markham Gateway Kid's Club", "https://www.markhamgatewaykidsclub.com/"],
  ["Markville Child Care Centre", "https://www.markvillechildcare.com/"],
  ["McGivney Early Learning Centre", "https://www.mcgivneychildcare.com/"],
  ["Milliken Mills School-Age Child Care", "https://www.millikenmillschildcare.com/"],
  ["Montessori North School", "https://www.montessorinorth.ca/"],
  ["Mount Joy YMCA School Age", "https://ymcagta.org/find-a-y/mount-joy-child-care-centre"],
  ["Pals", "https://www.palschildcare.com/"],
  ["Parkland Child Care Centre", "https://www.parklandchildcare.com/"],
  ["Parkview YMCA School Age", "https://ymcagta.org/find-a-y/parkview-child-care-centre"],
  ["Pastimes", "https://www.pastimeschildcare.com/"],
  ["Polka Dot Academy Montessori Daycare", "https://www.polkadotacademy.com/"],
  ["Queens Montessori Academy", "https://www.queensmontessori.com/"],
  ["Radiant Way Montessori School", "https://www.radiantwaymontessori.com/"],
  ["Rainbows", "https://www.rainbowschildcare.com/"],
  ["Randall Child Care Centre", "https://www.randallchildcare.com/"],
  ["Rocking Horse Day Nursery", "https://www.rockinghorsedaynursery.com/"],
  ["Rouge Park YMCA Child Care", "https://ymcagta.org/find-a-y/rouge-park-child-care-centre"],
  ["Safari Kid Markham", "https://www.safarikidinternational.com/locations/canada/markham/"],
  ["Upper Canada Child Care at San Lorenzo Ruiz CES", "https://uppercanadachildcare.com/locations/san-lorenzo-ruiz-catholic-elementary-school/"],
  ["Upper Canada Child Care at Nokiidaa PS", "https://uppercanadachildcare.com/locations/nokiidaa-public-school/"],
  ["Sir Richard W. Scott B & A School Program", "https://www.sirrichardwscottchildcare.com/"],
  ["Upper Canada Child Care at Sir Wilfrid Laurier PS", "https://uppercanadachildcare.com/locations/sir-wilfrid-laurier-public-school/"],
  ["Wesley Christian Early Learning Centre", "https://www.wesleychristian.ca/"],
  ["St. Michael Child Care Centre", "https://www.stmichaelchildcare.com/"],
  ["St. Anthony Child Care Centre", "https://www.stanthonychildcare.com/"],
  ["Upper Canada Child Care at St. Benedict CES", "https://uppercanadachildcare.com/locations/st-benedict-catholic-elementary-school/"],
  ["St. Edward Before & After School Program", "https://www.stedwardchildcare.com/"],
  ["St. Francis Xavier Before & After Child Care Prog.", "https://www.stfrancisxavierchildcare.com/"],
  ["St. Joseph Childrens Program", "https://www.stjosephchildcare.com/"],
  ["St. Julia Billiart School Age Program", "https://www.stjuliabilliartchildcare.com/"],
  ["St. Justin Martyr Before & After School Program", "https://www.stjustinmartyrchildcare.com/"],
  ["St. Mary of Leuca Daycare", "https://www.stmaryofleucadaycare.com/"],
  ["St. Monica Child Care Centre", "https://www.stmonicachildcare.com/"],
  ["St. Patrick Before & After School Program", "https://www.stpatrickchildcare.com/"],
  ["Upper Canada Child Care at St. Rene Goupil-St. Luke CES", "https://uppercanadachildcare.com/locations/st-rene-goupil-st-luke-catholic-elementary-school/"],
  ["Upper Canada Child Care at Stornoway Cresent PS", "https://uppercanadachildcare.com/locations/stornoway-crescent-public-school/"],
  ["Sunrise Montessori School", "https://www.sunrisemontessori.ca/"],
  ["Thornhill Child Care Centre", "https://www.thornhillchildcare.com/"],
  ["Torah Tots Nursery", "https://www.torahtotsnursery.com/"],
  ["Trillium School", "https://www.trilliumschool.ca/"],
  ["Unionville Meadows School-Age Childcare", "https://www.unionvillemeadowschildcare.com/"],
  ["Unionville Discovery Preschool", "https://www.unionvillediscoverypreschool.com/"],
  ["Victoria Square Schoolhouse Early Childhood Education Centre", "https://www.victoriasquareschoolhouse.com/"],
  ["Upper Canada Child Care Victoria Square PS", "https://uppercanadachildcare.com/locations/victoria-square-public-school/"],
  ["Upper Canada Child Care at William Armstrong PS", "https://uppercanadachildcare.com/locations/william-armstrong-public-school/"],
  ["Willowbrook YMCA School Age", "https://ymcagta.org/find-a-y/willowbrook-child-care-centre"],
  ["Upper Canada Child Care at Wismer PS", "https://uppercanadachildcare.com/locations/wismer-public-school/"],
  ["Woodhaven Junior Y", "https://ymcagta.org/find-a-y/woodhaven-child-care-centre"],
  ["York Montessori Private School", "https://www.yorkmontessori.com/"],
]);

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
  const [bookmarks, bookmarksSetter] = useState<string[]>([]);
  const [ready, readySetter] = useState<boolean>(false);

  const mountEffect = () => {
    loadFile();

    return () => {
      readySetter(false);
    };
  };

  useEffect(mountEffect, []);

  const loadFile = async () => {
    const bookmarkStr = await fs.readFile("bookmarks.json");
    bookmarksSetter(JSON.parse(bookmarkStr));
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
    }).map(x => ({ ...x, URL: DayCareWebsiteMap.get(x.NAME) ?? "" })));

    readySetter(true);
  };

  const columnConfig = useMemo<GridColDef[]>(() => [
    {
      field: 'NAME',
      headerName: 'Name',
      renderCell: (params: GridCellParams<DayCare, string>) => <Link target="_blank" href={params.row.URL}>{params.value}</Link>,
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

  const handleRowSelect = async (rowSelectionModel: GridRowSelectionModel, details: GridCallbackDetails<any>) => {
    console.log(rowSelectionModel);
    const bookmarkedDayCares = dayCareList.filter(x => rowSelectionModel.includes(x.OBJECTID));
    fs.writeFile('bookmarks.json', JSON.stringify(bookmarkedDayCares.map(x => x.OBJECTID))).then(() => {
      bookmarksSetter(bookmarkedDayCares.map(x => x.OBJECTID));
      loadFile();
    });

  };

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
          {ready &&
            <DataGrid
              getRowId={x => x.OBJECTID}
              rows={dayCareList.filter(x => (new RegExp(activePostalCode).test(x.POSTAL_CODE)))}
              columns={columnConfig}
              pagination
              checkboxSelection
              rowSelectionModel={bookmarks}
              onRowSelectionModelChange={handleRowSelect}
            />
          }
        </Box>
      </Box>
    </>
  );
}

export default App;
