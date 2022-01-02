import React from "react";
import { ResourceType, Users } from "../types";
import { getImg } from "../utils/index.";
import styled from "styled-components";

type Props = {
  usersData: Users;
};

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
  text-transform: uppercase;
  border: none;
  padding-left: 10px; /* width of cell-color + margin-left of player-name */
  font-size: 85%;
`;

// BODY
const TableBodyRow = styled.tr`
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
const TableBodyCell = styled.td`
  color: black;
  border: none;
  box-sizing: unset;
  padding: 0 2px;
  text-align: center;
  line-height: 3em;
  vertical-align: top;
`;

const TableImage = styled.img`
  width: 24px;
  height: 36px;
`;

const tableHeaders = Object.keys(ResourceType);

const Table: React.FC<Props> = (props) => {
  const { usersData } = props;

  return (
    <TableContainer>
      {/* HEADER */}
      <TableHeader>
        <tr>
          <TablePlayerHeader>Name</TablePlayerHeader>
          {tableHeaders.map((header) => (
            <TableBodyCell>
              <TableImage src={getImg(header.toLowerCase())} />
            </TableBodyCell>
          ))}
        </tr>
      </TableHeader>
      {/* BODY */}
      <tbody>
        {Object.keys(usersData).map((user) => {
          return (
            <TableBodyRow>
              {/* USER NAME AND COLOR */}
              <TablePlayerBodyCell>
                <TablePlayerBodyCellColor
                  color={usersData[user].config.color}
                />
                <TablePlayerName color={usersData[user].config.color}>
                  {user}
                </TablePlayerName>
              </TablePlayerBodyCell>
              {/* COUNT */}
              {tableHeaders.map((header) => (
                <TableBodyCell>
                  {usersData[user].resources[header]}
                </TableBodyCell>
              ))}
            </TableBodyRow>
          );
        })}
      </tbody>
    </TableContainer>
  );
};

export default Table;
