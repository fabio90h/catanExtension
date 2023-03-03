import React from 'react'
import { Action, ActionType } from '../reducer';
import { setUsername as dispatchUsername } from '../scripts/actions/setUsername/setUsername.action';

type Props = {
    dispatch: React.Dispatch<Action>;
};

export const Username: React.FC<Props> = ({dispatch}) => {
    const [username, setUsername] = React.useState('')

    const handleOnSubmit = () => {
        dispatchUsername(username, dispatch)
    }

    return <div>
        <input value={username} onChange={(e) => setUsername(e.target.value)}/>
        <button onClick={handleOnSubmit}>Submit</button>
    </div>
}