import { Transaction } from "@prisma/client";
import { useReactTable } from "@tanstack/react-table";
import Link from "next/link";
import React from "react";

interface Props {
  transactions: Transaction[];
}

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

const Table = ({ transactions }: Props) => {
  const table = useReactTable({
    columns: {},
  });

  return (
    <table className="table-auto border-collapse border border-slate-500 p-3">
      <thead>
        <tr>
          <th className="text-center border border-slate-600 p-2" scope="col">
            Transaction hash
          </th>
          <th className="text-center border border-slate-600 p-2">
            Transfers (id, amount, output)
          </th>
          <th className="text-center border-slate-600 border p-2" scope="col">
            Symbol
          </th>
          <th className="text-center border-slate-600 border p-2" scope="col">
            Decimals
          </th>
          <th className="text-center border-slate-600 border p-2" scope="col">
            Block id
          </th>
          <th className="text-center border-slate-600 border p-2" scope="col">
            Block timestamp
          </th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((tx) => {
          return (
            <tr key={tx.id} className="table-row">
              <td className="whitespace-nowrap px-6 text-center border border-slate-700">
                <Link
                  href={`https://mempool.space/tx/${tx.id}`}
                  className="underline"
                >
                  {tx.id}
                </Link>
              </td>
              <td className="border-slate-700 border whitespace-nowrap px-6 text-center">
                {JSON.stringify(convertTransfersToTuple(tx.transfers as any))}
              </td>
              <td className="border-slate-700 border whitespace-nowrap px-6 text-center">
                {(tx.issuance as any)?.symbol ?? "missing symbol"}
              </td>
              <td className="border-slate-700 border whitespace-nowrap px-6 text-center">
                {(tx.issuance as any)?.decimals ?? "missing decimals"}
              </td>
              <td className="border-slate-700 border whitespace-nowrap px-6 text-center text-ellipsis max-w-md">
                {tx.blockNumber == "-1" ? (
                  "-"
                ) : (
                  <p className="">{`${tx.blockNumber.substring(
                    0,
                    10
                  )}...${tx.blockNumber.slice(-10)}`}</p>
                )}
              </td>
              <td className="border-slate-700 border whitespace-nowrap px-6 text-center">
                {tx.blockTimestamp == "-1" ? "-" : tx.blockTimestamp}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default Table;
