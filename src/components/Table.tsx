import React from "react";
import { GameData, ResourceType, Theft as TheftType } from "../types";

import styled from "styled-components";
import Theft from "./Theft";
import { Action } from "../reducer";
import { calculateTheftForPlayerAndResources } from "../utils/helpers/general/calculateTheftForPlayerAndResources/calculateTheftForPlayerAndResources.general";
import { getImg } from "../utils/helpers/general/getImg/getImg.general";
import { Username } from "./Username";

type Props = {
  gameData: GameData;
  dispatch: React.Dispatch<Action>;
};

const tableHeaders = Object.keys(ResourceType) as ResourceType[];

const TableContainer = styled.table`
  position: absolute;
  background-color: white;
  z-index: 9999;
  top: 10px;
  left: 10px;
  padding: 3px;
  border: none;
`;

// HEADER
const TableHeader = styled.thead`
  padding: 4px 7px 2px; /* default override cell padding */
  border: none;
`;
const TablePlayerHeader = styled.th`
  color: black;
  font-weight: 600;
  text-align: center;
  text-transform: uppercase;
  border: none;
  padding-left: 10px; /* width of cell-color + margin-left of player-name */
  font-size: 85%;
`;

// BODY
export const TableBodyRow = styled.tr`
  border: none;
  height: 3em;
  &:nth-child(2n-1) {
    background-color: #eeeeee;
  }
  &:nth-child(2n) {
    background-color: #f9f9f9;
  }
`;
const TablePlayerBodyCell = styled.td`
  border: none;
  display: inline-flex;
  padding: 0;
  line-height: 3em;
`;
const TablePlayerBodyCellColor = styled.div<{ color: string }>`
  width: 6px;
  background-color: #000;
  display: inline-block;
  background-color: ${(props) => props.color};
`;
const TablePlayerName = styled.span<{ color: string }>`
  margin: 0px 10px 0 4px;
  color: ${(props) => props.color};
`;
export const TableBodyCell = styled.td`
  color: black;
  border: none;
  box-sizing: unset;
  padding: 0 2px;
  text-align: center;
  line-height: 3em;
  vertical-align: top;
`;

export const TableImage = styled.img`
  width: 24px;
  height: 36px;
`;

// TODO: For testing only
const mockTable: TheftType = {
  who: { stealer: "Fabio", victim: "Alex" },
  what: {
    [ResourceType.BRICK]: 1,
    [ResourceType.WHEAT]: 1,
    [ResourceType.SHEEP]: 1,
  },
};

const Table: React.FC<Props> = (props) => {
  const {
    gameData: { users, thefts, username },
    dispatch,
  } = props;

  React.useEffect(() => console.log("thefts", thefts), [thefts]);

  if(!username){
    return <Username dispatch={dispatch} />
  }

  return (
    <TableContainer>
      {/* HEADER */}
      <TableHeader>
        <tr>
          <TablePlayerHeader>Name</TablePlayerHeader>
          {tableHeaders.map((header) => (
            <TableBodyCell>
              <TableImage src={getImg(header)} />
            </TableBodyCell>
          ))}
        </tr>
      </TableHeader>
      {/* BODY */}
      <tbody>
        {Object.keys(users).map((user) => {
          return (
            <TableBodyRow>
              {/* USER NAME AND COLOR */}
              <TablePlayerBodyCell>
                <TablePlayerBodyCellColor color={users[user].config.color} />
                <TablePlayerName color={users[user].config.color}>
                  {user}
                </TablePlayerName>
              </TablePlayerBodyCell>
              {/* COUNT WITH POSSIBLE THEFT*/}
              {tableHeaders.map((header) => {
                const theftCount = calculateTheftForPlayerAndResources(
                  user,
                  header,
                  thefts
                );
                const resourceCount = users[user].resources[header];
                return (
                  <TableBodyCell>
                    {resourceCount}
                    {theftCount !== 0 && ` (${resourceCount + theftCount})`}
                  </TableBodyCell>
                );
              })}
            </TableBodyRow>
          );
        })}
      </tbody>
      {/* List of thefts */}
      <tbody style={{ border: "3px solid red" }}>
        {thefts.map((theft, id) => {
          return (
            <Theft
              key={id}
              id={id}
              theft={theft}
              users={users}
              dispatch={dispatch}
            />
          );
        })}
      </tbody>
    </TableContainer>
  );
};

export default Table;
