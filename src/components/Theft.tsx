import React from "react";
import { Action } from "../reducer";
import styled from "styled-components";
import { ResourceType, Theft as TheftType, Users } from "../types";
import { manuallyResolveUnknownTheft } from "../utils/index.";
import { TableBodyRow, TableImage } from "./Table";
import { getImg } from "../utils/helpers/general/getImg/getImg.general";

type Props = {
  theft: TheftType;
  users: Users;
  id: number;
  dispatch: React.Dispatch<Action>;
};

// TODO: For testing only
const mockUser: Users = {
  Fabio: {
    resources: {
      [ResourceType.WOOD]: 3,
      [ResourceType.BRICK]: 3,
      [ResourceType.SHEEP]: 3,
      [ResourceType.STONE]: 3,
      [ResourceType.WHEAT]: 3,
    },
    config: { color: "red" },
  },
  Alex: {
    resources: {
      [ResourceType.WOOD]: 1,
      [ResourceType.BRICK]: 0,
      [ResourceType.SHEEP]: 1,
      [ResourceType.STONE]: 0,
      [ResourceType.WHEAT]: 2,
    },
    config: { color: "blue" },
  },
};

const ImageContainer = styled.div`
  display: flex;
  justify-content: space-around;
`;

const Theft: React.FC<Props> = (props) => {
  const { theft, users, dispatch, id } = props;

  const handleResourceClick = React.useCallback(
    (resource: ResourceType) =>
      manuallyResolveUnknownTheft(
        dispatch,
        resource,
        theft.who.stealer,
        theft.who.victim,
        id
      ),
    [dispatch, id, theft.who.stealer, theft.who.victim]
  );

  return (
    <>
      <TableBodyRow>
        <th
          scope="row"
          colSpan={6}
          style={{ color: "black", textAlign: "center" }}
        >
          <span style={{ color: users[theft.who.stealer].config.color }}>
            {theft.who.stealer}
          </span>{" "}
          stealing{" "}
          <span style={{ color: users[theft.who.victim].config.color }}>
            {theft.who.victim}
          </span>
        </th>
      </TableBodyRow>

      <TableBodyRow>
        <th scope="row" colSpan={6}>
          <ImageContainer>
            {Object.keys(theft.what).map((resource) => (
              <a onClick={() => handleResourceClick(resource as ResourceType)}>
                <TableImage src={getImg(resource as ResourceType)} />
              </a>
            ))}
            {/* MIGHT NOT BE NECESSARY */}
            {/* <a onClick={handleUnknownResourceClick}>
              <TableImage src={getImg(UnknownType.UNKOWN)} />
            </a> */}
          </ImageContainer>
        </th>
      </TableBodyRow>
    </>
  );
};

export default Theft;
