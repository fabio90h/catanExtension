import React from "react";
import { Action, ActionType } from "../reducer";
import styled from "styled-components";
import { ResourceType, Theft as TheftType, UnknownType, Users } from "../types";
import { getImg } from "../utils/index.";
import { TableBodyRow, TableImage } from "./Table";

type Props = {
  theft: TheftType;
  users: Users;
  id: number;
  dispatch: React.Dispatch<Action>;
};

// TODO: For testing only
const mockUser = {
  Fabio: { config: { color: "red" } },
  Alex: { config: { color: "blue" } },
};

const ImageContainer = styled.div`
  display: flex;
  justify-content: space-around;
`;

const Theft: React.FC<Props> = (props) => {
  const { theft, users, dispatch, id } = props;

  const handleResourceClick = React.useCallback(
    (resource: ResourceType) => {
      dispatch({
        type: ActionType.ADD_RESOURCES,
        payload: { user: theft.who.stealer, addResources: [resource] },
      });
      dispatch({
        type: ActionType.SUBTRACT_RESOURCES,
        payload: { user: theft.who.victim, subtractResources: [resource] },
      });
      dispatch({
        type: ActionType.RESOLVE_UNKNOWN_STEAL,
        payload: { id },
      });
    },
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
            {theft.what.map((resource) => (
              <a onClick={() => handleResourceClick(resource)}>
                <TableImage src={getImg(resource)} />
              </a>
            ))}
            <a onClick={() => console.log("unknown")}>
              <TableImage src={getImg(UnknownType.UNKOWN)} />
            </a>
          </ImageContainer>
        </th>
      </TableBodyRow>
    </>
  );
};

export default Theft;
