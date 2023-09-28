"use client";
import { Transaction } from "@prisma/client";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";

interface Transfer {
  id: number;
  amount: number;
  output: number;
}

function convertTransfersToTuple(transfers: Transfer[]) {
  let allTransfers: any[] = [];

  transfers.forEach((t) => allTransfers.push([t.id, t.amount, t.output]));
  return allTransfers;
}

const cols: TableColumn<Transaction>[] = [
  {
    name: "Transaction Hash",
    selector: (row: Transaction) => row.id,
    sortable: true,
    cell: (row) => (
      <Link
        className="underline"
        target="_blank"
        href={`https://mempool.space/tx/${row.id}`}
      >
        {row.id}
      </Link>
    ),
  },

  {
    name: "Transfers (id, amount, output)",
    selector: (row: Transaction) =>
      JSON.stringify(convertTransfersToTuple(row.transfers as any)),
    width: "200px",
    sortable: true,
  },
  {
    name: "Symbol",
    selector: (row: Transaction) =>
      (row.issuance as any)?.symbol ?? "missing symbol",
    width: "100px",
    sortable: true,
  },
  {
    name: "Decimals",
    selector: (row: Transaction) =>
      (row.issuance as any)?.decimals ?? "missing decimals",
    width: "100px",
    sortable: true,
  },
  {
    name: "Block Height",
    selector: (row: Transaction) => row.blockHeight,
    sortable: true,
    width: "140px",
  },
  {
    name: "Block id",
    selector: (row: Transaction) => row.blockNumber,
    sortable: true,
    cell: (row) => (
      <Link
        className="underline"
        href={`https://mempool.space/block/${row.blockNumber}`}
      >
        {row.blockNumber}
      </Link>
    ),
  },
  {
    name: "Block timestamp",
    selector: (row: Transaction) => row.blockTimestamp,
    width: "150px",
    sortable: true,
  },
];

const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;

const Table2 = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [items, setItems] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(20);

  useEffect(() => {
    getTransactions(1, perPage);
  }, [perPage]);

  async function getTransactions(page: number, perPage: number) {
    try {
      const response = await axios.get(
        `${backendURL}/tx?page=${page}&perPage=${perPage}`
      );
      setIsLoaded(true);
      setTotalRows(response.data.meta.total);
      setItems(response.data.data);
      return response.data;
    } catch (e) {
      setError("Error getting data ...!");
    }
  }

  const handlePageChange = (page: number) => {
    getTransactions(page, perPage);
  };

  const handlePerRowsChange = async (newPerPage: number, page: number) => {
    setPerPage(newPerPage);
  };

  if (error) return <h1>Something went wrong!</h1>;
  if (!isLoaded) return <h1>Loading ...</h1>;

  return (
    <DataTable
      className="w-full"
      columns={cols}
      data={items}
      pagination
      paginationServer
      highlightOnHover
      persistTableHead
      paginationTotalRows={totalRows}
      onChangePage={handlePageChange}
      onChangeRowsPerPage={handlePerRowsChange}
      paginationResetDefaultPage
      paginationDefaultPage={1}
      paginationPerPage={20}
    />
  );
};

export default Table2;
