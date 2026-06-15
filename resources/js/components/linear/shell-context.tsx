import { Issue, IssueStatus } from '@/lib/issues';
import { createContext, useContext } from 'react';

interface ShellContextValue {
    openNewIssue: (status?: IssueStatus) => void;
    openPalette: () => void;
    openIssue: (issue: Issue) => void;
}

export const ShellContext = createContext<ShellContextValue>({
    openNewIssue: () => {},
    openPalette: () => {},
    openIssue: () => {},
});

export const useShell = () => useContext(ShellContext);
