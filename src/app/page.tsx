'use client';

import { Pagination, Table, TableData } from "@mantine/core";
import { useEffect, useState } from "react";

interface Score {
    overall_contribution: number;
    percentile: number;
    rank: number;
    value: number;
}

interface ChallengerPeriod {
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
    challenger_period: ChallengerPeriod;
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
}

interface FormattedTableRowData {
    miner: string;
    annual_ret: string;
    calmar: number;
    sharpe: number;
    sortino: number;
    omega: number;
    stat_conf: number;
    rank: number;
}

const headers = [
    'Miner',
    'Annualized 90-day Return',
    'Calmar',
    'Sharpe',
    'Sortino',
    'Omega',
    'Statistical Confidence',
    'Miner Rank'
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
        };
        rows.push(row);
    }
    return rows;
}  

function formatTableRowData(data: TableRowData[]): (string | number)[][] {
    return data.map((row) => ([
        row.miner,
        `${parseFloat(row.annual_ret.toFixed(1))}%`,
        parseFloat(row.calmar.toFixed(2)),
        parseFloat(row.sharpe.toFixed(2)),
        parseFloat(row.sortino.toFixed(2)),
        parseFloat(row.omega.toFixed(2)),
        parseFloat(row.stat_conf.toFixed(2)),
        row.rank,
    ]));
} 

export default function Home() {
    const [activePage, setActivePage] = useState<number>(1);
    const [minerData, setMinerData] = useState<(string | number)[][]>([]);

    useEffect(() => {
        fetch('/data.json')
            .then(res => res.json())
            .then(data => {
                const apiResponse: ApiResponse = data;
                setMinerData(formatTableRowData(getRowData(apiResponse)));
            })
            .catch(error => console.log("Failed to fetch file:", error));
    }, []);

    const rowsPerPage = 20;
    const numSiblings = 1;
    const startIndex = (activePage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentRows = minerData.slice(startIndex, endIndex);

    const tableData: TableData = {
        head: headers,
        body: currentRows,
    }

    return (
        <div className="p-4">
            <Table data={tableData} />
            <Pagination 
                page={activePage}
                onChange={setActivePage}
                total={Math.ceil(minerData.length / rowsPerPage)}
                siblings={numSiblings}
            />
        </div>
    );
}
