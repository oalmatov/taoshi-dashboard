'use client';

import { Pagination, Table } from "@mantine/core";
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

function getRowData(json: ApiResponse): TableRowData[] {
    let rows: TableRowData[] = [];
    for (const data of json.data) {
        let row: TableRowData = {
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

function createTableRows(data: TableRowData[]): JSX.Element[] {
    return data.map((row: TableRowData, rowIdx:number) => (
        <Table.Tr key={rowIdx}>
            <Table.Td>{row.miner}</Table.Td>
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

export default function Home() {
    const [activePage, setActivePage] = useState<number>(1);
    const [rows, setRows] = useState<JSX.Element[]>([]);

    useEffect(() => {
        fetch('/data.json')
            .then(res => res.json())
            .then(data => {
                console.log(data);
                const apiResponse: ApiResponse = data;
                setRows(createTableRows(getRowData(apiResponse)));
            })
            .catch(error => console.log("Failed to fetch file:", error));
    }, []);

    const rowsPerPage = 20;
    const numSiblings = 1;
    const startIndex = (activePage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentRows: JSX.Element[] = rows.slice(startIndex, endIndex);

    return (
        <div className="p-4">
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        {headers.map((header, headerIdx) => (
                            <Table.Th key={headerIdx}>
                                {header}
                            </Table.Th>
                        ))}
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{currentRows}</Table.Tbody>
            </Table>
            <Pagination 
                page={activePage}
                onChange={setActivePage}
                total={Math.ceil(rows.length / rowsPerPage)}
                siblings={numSiblings}
                color="orange"
                radius="xs"
                size="xs"
            />
        </div>
    );
}
