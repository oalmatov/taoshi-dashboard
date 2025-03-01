'use client';

import React from "react";

import { Pagination, Table, ActionIcon, CopyButton, Tooltip, Title, Select} from "@mantine/core";
import { IconCopy, IconCheck, IconArrowUp, IconArrowDown } from '@tabler/icons-react';
import { JSX, useEffect, useState } from "react";

interface Score {
    overall_contribution: number;
    percentile: number;
    rank: number;
    value: number;
}

interface ChallengePeriod {
    remaining_time_ms: number;
    start_time_ms: number;
    status: string;
}

interface AugmentedScores {
    calmar: Score;
    omega: Score;
    return: Score;
    sharpe: Score;
    sortino: Score;
    statistical_confidence: Score;
}

interface Weight {
    percentile: number;
    rank: number;
    value: number;
}

interface ApiData {
    hotkey: string;
    augmented_scores: AugmentedScores;
    challengeperiod: ChallengePeriod;
    weight: Weight;
}

interface ApiResponse {
    data: ApiData[];
}

interface TableRowData {
    miner: string;
    annual_ret: number;
    calmar: number;
    sharpe: number;
    sortino: number;
    omega: number;
    stat_conf: number;
    rank: number;
    challengeperiod: string;
}

const headers: string[] = [
    'Miner',
    'Annualized 90-day Return',
    'Calmar',
    'Sharpe',
    'Sortino',
    'Omega',
    'Statistical Confidence',
    'Miner Rank',
    'Challenge Period',
]

const headerToKeyMap: Record<string, keyof TableRowData> = {
  'Miner': 'miner',
  'Annualized 90-day Return': 'annual_ret',
  'Calmar': 'calmar',
  'Sharpe': 'sharpe',
  'Sortino': 'sortino',
  'Omega': 'omega',
  'Statistical Confidence': 'stat_conf',
  'Miner Rank': 'rank',
  'Challenge Period': 'challengeperiod',
};

function getRowData(json: ApiResponse): TableRowData[] {
    const rows: TableRowData[] = [];
    for (const data of json.data) {
        const row: TableRowData = {
            miner: data.hotkey,
            annual_ret: data.augmented_scores.return.value,
            calmar: data.augmented_scores.calmar.value,
            sharpe: data.augmented_scores.sharpe.value,
            sortino: data.augmented_scores.sortino.value,
            omega: data.augmented_scores.omega.value,
            stat_conf: data.augmented_scores.statistical_confidence.value,
            rank: data.weight.rank,
            challengeperiod: data.challengeperiod.status,
        };
        rows.push(row);
    }
    return rows;
}  

function MinerId({ minerId }: { minerId: string}): JSX.Element {
    return (
        <div className="flex flex-row items-center align-middle gap-2">
            <CopyButton value="https://mantine.dev" timeout={2000}>
                {({ copied, copy }) => (
                    <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
                        <ActionIcon color="orange" variant="subtle" onClick={copy}>
                            {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
                        </ActionIcon>
                    </Tooltip>
                )}
            </CopyButton>
            <a className="text-amber-600 hover:underline" href="#">{minerId}</a>
        </div>
    )

}

function createTableRowElements(data: TableRowData[]): JSX.Element[] {
    return data.map((row: TableRowData, rowIdx:number) => (
        <Table.Tr key={rowIdx}>
            <Table.Td><MinerId minerId={row.miner} /></Table.Td>
            <Table.Td>{`${parseFloat(row.annual_ret.toFixed(1))}%`}</Table.Td>
            <Table.Td>{parseFloat(row.calmar.toFixed(2))}</Table.Td>
            <Table.Td>{parseFloat(row.sharpe.toFixed(2))}</Table.Td>
            <Table.Td>{parseFloat(row.sortino.toFixed(2))}</Table.Td>
            <Table.Td>{parseFloat(row.omega.toFixed(2))}</Table.Td>
            <Table.Td>{parseFloat(row.stat_conf.toFixed(2))}</Table.Td>
            <Table.Td>{row.rank}</Table.Td>
            <Table.Td>{row.challengeperiod}</Table.Td>
        </Table.Tr>
    ))
}

function sortData(rows: TableRowData[], column: (string | null), sortDirection: (string | null)) {
    if (!column || !sortDirection) {
        return rows;
    }

    return rows.sort((a:TableRowData, b:TableRowData) => {
        const valueA: (string | number) = a[headerToKeyMap[column]];
        const valueB: (string | number) = b[headerToKeyMap[column]];
        if (typeof valueA === 'string' && typeof valueB === 'string') {
            return sortDirection === 'Ascending'
                ? valueA.localeCompare(valueB)
                : valueB.localeCompare(valueB);
        } else if (typeof valueA === 'number' && typeof valueB === 'number') {
            return sortDirection === 'Ascending'
                ? valueA - valueB
                : valueB - valueA;
        } else {
            return 0;
        }
    });
}

export default function Home() {
    const [activePage, setActivePage] = useState<number>(1);
    const [rows, setRows] = useState<TableRowData[]>([]);
    const [filter, setFilter] = useState<string | null>(null);
    const [sortColumn, setSortColumn] = useState<string | null>("Miner Rank");
    const [sortDirection, setSortDirection] = useState<string | null>("Ascending");

    useEffect(() => {
        fetch('/data.json')
            .then(res => res.json())
            .then(data => {
                console.log(data);
                const apiResponse: ApiResponse = data;
                setRows(getRowData(apiResponse));
            })
            .catch(error => console.log("Failed to fetch file:", error));
    }, []);

    const rowsPerPage = 20;
    const numSiblings = 1;
    const startIndex = (activePage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const filteredRows = rows.filter(row => {
        if (!filter || filter === "None") {
            return row;
        }
        return row.challengeperiod.toLowerCase().includes(filter.toLowerCase());
    });
    const sortedColumns = sortData(filteredRows, sortColumn, sortDirection);
    const currentRows: JSX.Element[] = createTableRowElements(sortedColumns.slice(startIndex, endIndex));

    return (
        <div className="p-4">
            <div className="flex flex-col md:flex-row justify-between mb-5">
                <div className="whitespace-nowrap mr-4">
                    <Title order={3} size="h3">Top Miners</Title>
                </div>
                <div className="flex flex-col mt-3 md:flex-row md:mt-0 items-start justify-start gap-2">
                    <Select 
                        value={sortColumn}
                        onChange={(column) => setSortColumn(column)}
                        data={headers.filter(item => item !== 'Challenge Period')}
                    />
                    <Select 
                        value={sortDirection}
                        onChange={(direction) => setSortDirection(direction)}
                        data={['Ascending', 'Descending']}
                    />
                    <Select 
                        placeholder="Filter by challenge period"
                        onChange={(filter) => setFilter(filter)}
                        data={[
                            { value: 'success', label: 'Success' },
                            { value: 'testing', label: 'Testing' },
                            { value: '', label: 'None' },
                        ]}
                    />
                </div>
            </div>
            <Table.ScrollContainer minWidth={10}>
                <Table>
                    <Table.Thead>
                        <Table.Tr>
                            {headers.map((header, headerIdx) => (
                                <Table.Th onClick={() => {
                                    setSortColumn(header);
                                    setSortDirection(sortDirection === 'Ascending' ? 'Descending' : 'Ascending')
                                }} key={headerIdx}>
                                    <div className="flex flex-row gap-3 items-center">
                                        {header}
                                        {sortColumn === header &&
                                            <span>
                                                {sortDirection == 'Ascending' ? (
                                                    <IconArrowUp color="orange" size={15} />
                                                ) : (
                                                        <IconArrowDown color="orange" size={15} />
                                                    )}
                                            </span>
                                        }
                                    </div>
                                </Table.Th>
                            ))}
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>{currentRows}</Table.Tbody>
                </Table>
            </Table.ScrollContainer>
            <Pagination 
                onChange={setActivePage}
                total={Math.ceil(filteredRows.length / rowsPerPage)}
                siblings={numSiblings}
                color="orange"
                radius="xs"
                size="xs"
            />
        </div>
    );
}
