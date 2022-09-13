import { FC, useReducer } from 'react';
import { UIContext } from './UIContext';
import { UIReducer } from './UIReducer';

export interface UIState {
    isMenuOpen: boolean;
}

const UIInitialState: UIState = {
    isMenuOpen: false
};

export const UIProvider: FC = ({ children }) => {
    const [state, dispatch] = useReducer(UIReducer, UIInitialState);

    const toggleSideMenu = () => {
        dispatch({ type: '[UI] - ToggleMenu' });
    };

    return (
        <UIContext.Provider value={{
            ...state,
            toggleSideMenu
        }}
        >
            {children}
        </UIContext.Provider>
    );
};