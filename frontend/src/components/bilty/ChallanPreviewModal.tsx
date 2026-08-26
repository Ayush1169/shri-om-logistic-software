"use client";

import { useEffect, useState } from "react";
import {
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  ChallanPreviewRow,
  ImportChallanItem,
  getChallanPreview,
  importChallanBilties,
} from "@/lib/challan";

import { getCustomers } from "@/services/customer.service";

import { Customer } from "@/types/customer";

interface Props {
  challanId: number;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Extra editable details for every Bilty row
 */
interface BiltyDetails {
  consigneeId: number | null;
  consigneeName: string | null;
  pMarka: string;
  goodsDescription: string;
  paymentType: string;
}

/**
 * Some fields can come from OCR/backend preview.
 * These are kept optional so the frontend doesn't break
 * if the backend doesn't send a particular field.
 */
type PreviewRow = ChallanPreviewRow & {
  consigneeName?: string | null;
  consignee?: string | null;
  pMarka?: string | null;
  item?: string | null;
  goodsDescription?: string | null;
  goods?: string | null;
  paymentType?: string | null;
  destination?: string | null;
};

export default function ChallanPreviewModal({
  challanId,
  onClose,
  onSuccess,
}: Props) {
  const [rows, setRows] = useState<PreviewRow[]>([]);

  const [customers, setCustomers] = useState<Customer[]>([]);

  const [loading, setLoading] = useState(true);

  const [loadingCustomers, setLoadingCustomers] =
    useState(true);

  const [importing, setImporting] =
    useState(false);

  const [selectedIds, setSelectedIds] =
    useState<number[]>([]);

  /**
   * Extra details for every OCR row
   */
  const [details, setDetails] =
    useState<Record<number, BiltyDetails>>({});

  /**
   * ---------------------------------------------------
   * LOAD CHALLAN PREVIEW
   * ---------------------------------------------------
   */
  useEffect(() => {
    const loadPreview = async () => {
      try {
        setLoading(true);

        const response =
          await getChallanPreview(challanId);

        const previewRows =
          (response?.data?.rows || []) as PreviewRow[];

        setRows(previewRows);

        /**
         * Select all non-imported rows
         */
        const availableIds =
          previewRows
            .filter(
              (row) => !row.imported
            )
            .map(
              (row) => row.id
            );

        setSelectedIds(availableIds);

        /**
         * Initialize details
         */
        const initialDetails: Record<
          number,
          BiltyDetails
        > = {};

        previewRows.forEach((row) => {
          initialDetails[row.id] = {
  consigneeId: null,

  // OCR se jo customer/consignee name aaya hai
  consigneeName:
    row.consigneeName ??
    row.consignee ??
    null,

  pMarka:
    row.pMarka ?? "",

  goodsDescription:
    row.item ??
    row.goodsDescription ??
    row.goods ??
    "",

  paymentType:
    row.paymentType ?? "",
};
        });

        setDetails(initialDetails);
      } catch (error: any) {
        console.error(
          "Challan Preview Error:",
          error
        );

        toast.error(
          error?.response?.data?.message ||
            "Failed to load challan preview."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPreview();
  }, [challanId]);

  /**
   * ---------------------------------------------------
   * LOAD ALL CUSTOMERS
   * ---------------------------------------------------
   */
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoadingCustomers(true);

        let page = 1;
        let allCustomers: Customer[] = [];

        while (true) {
          const response =
            await getCustomers(page, "");
             
          const currentCustomers =
            response?.customers || [];

          allCustomers = [
            ...allCustomers,
            ...currentCustomers,
          ];

          if (
            page >=
            response.totalPages
          ) {
            break;
          }

          page++;
        }

        setCustomers(allCustomers);
      } catch (error) {
        console.error(
          "Customer Load Error:",
          error
        );

        toast.error(
          "Failed to load customers."
        );
      } finally {
        setLoadingCustomers(false);
      }
    };

    loadCustomers();
  }, []);

  /**
   * ---------------------------------------------------
   * AUTOMATICALLY MATCH CONSIGNEE
   * ---------------------------------------------------
   *
   * Challan/OCR se consigneeName aayega.
   *
   * Example:
   *
   * OCR:
   * ABC TRADERS
   *
   * Customer:
   * ABC TRADERS
   *
   * => consigneeId automatically set
   */
  useEffect(() => {
  if (rows.length === 0) {
  return;
}

    setDetails((prev) => {
      const updated = {
        ...prev,
      };

      rows.forEach((row) => {
        if (!row.consigneeName) {
          return;
        }

        const normalizedOCRName =
          row.consigneeName
            .trim()
            .toLowerCase();

        const matchedCustomer =
          customers.find(
            (customer) =>
              customer.customerName
                .trim()
                .toLowerCase() ===
              normalizedOCRName
          );

        if (matchedCustomer) {
          updated[row.id] = {
            ...updated[row.id],
            consigneeId:
              matchedCustomer.id,
          };
        }
      });

      return updated;
    });
  }, [rows, customers]);

  /**
   * ---------------------------------------------------
   * UPDATE DETAILS
   * ---------------------------------------------------
   */
  const updateDetails = (
    rowId: number,
    field: keyof BiltyDetails,
    value: string | number | null
  ) => {
    setDetails((prev) => ({
      ...prev,

      [rowId]: {
        ...prev[rowId],
        [field]: value,
      },
    }));
  };

  /**
   * ---------------------------------------------------
   * TOGGLE ROW
   * ---------------------------------------------------
   */
  const toggleRow = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter(
            (item) => item !== id
          )
        : [...prev, id]
    );
  };

  /**
   * ---------------------------------------------------
   * SELECT / UNSELECT ALL
   * ---------------------------------------------------
   */
  const toggleAll = () => {
    const availableRows =
      rows.filter(
        (row) => !row.imported
      );

    if (
      selectedIds.length ===
      availableRows.length
    ) {
      setSelectedIds([]);
    } else {
      setSelectedIds(
        availableRows.map(
          (row) => row.id
        )
      );
    }
  };

  /**
   * ---------------------------------------------------
   * IMPORT SELECTED BILTIES
   * ---------------------------------------------------
   */
  const handleImport = async () => {
    if (
      selectedIds.length === 0
    ) {
      toast.error(
        "Please select at least one Bilty."
      );

      return;
    }

    const selectedRows =
      rows.filter((row) =>
        selectedIds.includes(row.id)
      );

    /**
     * ------------------------------------------------
     * VALIDATION
     * ------------------------------------------------
     *
     * Consignor / Pickup / Delivery removed.
     *
     * Required:
     * - Consignee
     * - Item
     * - Payment
     */
    for (const row of selectedRows) {
      const rowDetails =
        details[row.id];

      if (
        !rowDetails?.paymentType
      ) {
        toast.error(
          `Payment type missing for LR ${row.lrNo}`
        );

        return;
      }
    }

    /**
     * ------------------------------------------------
     * BUILD BACKEND PAYLOAD
     * ------------------------------------------------
     */
   const items: ImportChallanItem[] = selectedRows.map((row) => {
  const rowDetails = details[row.id];

  return {
    // Preview row identity
    previewId: row.id,

    // IMPORTANT:
    // Original Challan / LR data
    lrNo: row.lrNo ?? null,
    biltyDate: row.biltyDate ?? null,

    // Consignee
    consigneeId:
      rowDetails?.consigneeId ?? null,

    consigneeName:
      rowDetails?.consigneeName ??
      row.consigneeName ??
      row.consignee ??
      null,

    // P.Marka
    pMarka:
      rowDetails?.pMarka ??
      row.pMarka ??
      null,

    // Goods
    goodsDescription:
      rowDetails?.goodsDescription ??
      row.item ??
      row.goodsDescription ??
      row.goods ??
      "General Goods",

    // Destination
    destination:
      row.destination ??
      null,

    // Payment
    paymentType:
      rowDetails?.paymentType ??
      row.paymentType ??
      null,

    // Original OCR values
    packages:
      row.packages ?? null,

    weight:
      row.weight ?? null,

    freight:
      row.freight ?? 0,

    // Charges
    gst:
      row.gst ?? 0,

    hamali:
      row.hamali ?? 0,

    loadingCharges:
      row.loadingCharges ?? 0,

    unloadingCharges:
      row.unloadingCharges ?? 0,

    insuranceCharges:
      row.insuranceCharges ?? 0,

    // Weight
    chargeableWeight:
      row.chargeableWeight ??
      row.weight ??
      null,

    // Other
    eWayBillNumber:
      row.eWayBillNumber ??
      null,

    remarks:
      row.remarks ??
      null,
  };
});

    try {
      setImporting(true);

      await importChallanBilties(
        challanId,
        items
      );

      toast.success(
        `${items.length} bilties imported successfully.`
      );

      onSuccess();
    } catch (error: any) {
      console.error(
        "Import Bilty Error:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to import bilties."
      );
    } finally {
      setImporting(false);
    }
  };

  /**
   * ---------------------------------------------------
   * RENDER
   * ---------------------------------------------------
   */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[95vh] w-full max-w-[1600px] flex-col overflow-hidden rounded-xl bg-white shadow-xl">

        {/* -------------------------------------------
            HEADER
        -------------------------------------------- */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold">
              Challan Preview
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Review and complete Bilty details before importing.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={importing}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* -------------------------------------------
            BODY
        -------------------------------------------- */}
        <div className="flex-1 overflow-auto p-6">

          {/* LOADING */}
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2
                  size={22}
                  className="animate-spin"
                />

                Loading challan preview...
              </div>
            </div>
          ) : rows.length === 0 ? (
            /* EMPTY */
            <div className="flex min-h-[300px] flex-col items-center justify-center text-gray-500">
              <AlertCircle size={40} />

              <p className="mt-3 font-medium">
                No Bilty rows found.
              </p>
            </div>
          ) : (
            <>
              {/* ---------------------------------------
                  SUMMARY
              ---------------------------------------- */}
              <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">

                <div className="rounded-lg border bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">
                    Total Rows
                  </p>

                  <p className="mt-1 text-lg font-semibold">
                    {rows.length}
                  </p>
                </div>

                <div className="rounded-lg border bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">
                    Selected
                  </p>

                  <p className="mt-1 text-lg font-semibold">
                    {selectedIds.length}
                  </p>
                </div>

                <div className="rounded-lg border bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">
                    Imported
                  </p>

                  <p className="mt-1 text-lg font-semibold">
                    {
                      rows.filter(
                        (row) =>
                          row.imported
                      ).length
                    }
                  </p>
                </div>

                <div className="rounded-lg border bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">
                    Available
                  </p>

                  <p className="mt-1 text-lg font-semibold">
                    {
                      rows.filter(
                        (row) =>
                          !row.imported
                      ).length
                    }
                  </p>
                </div>

              </div>

              {/* ---------------------------------------
                  CUSTOMER LOADING
              ---------------------------------------- */}
              {loadingCustomers ? (
                <div className="mb-4 flex items-center gap-2 rounded-lg border bg-blue-50 p-4 text-sm text-blue-700">
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Loading customers...
                </div>
              ) : null}

              {/* ---------------------------------------
                  TABLE
              ---------------------------------------- */}
              <div className="overflow-x-auto rounded-lg border">
                <table className="min-w-[1400px] w-full text-sm">

                  {/* TABLE HEADER */}
                  <thead className="bg-gray-50">
                    <tr>

                      <th className="w-12 px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={
                            rows.filter(
                              (row) =>
                                !row.imported
                            ).length >
                              0 &&
                            selectedIds.length ===
                              rows.filter(
                                (row) =>
                                  !row.imported
                              ).length
                          }
                          onChange={toggleAll}
                        />
                      </th>

                      <th className="px-3 py-3 text-left">
                        S.No
                      </th>

                      <th className="px-3 py-3 text-left">
                        LR No
                      </th>

                      <th className="px-3 py-3 text-left">
                        Date
                      </th>

                      <th className="px-3 py-3 text-left">
                        Packages
                      </th>

                      <th className="px-3 py-3 text-left">
                        Weight
                      </th>

                      <th className="px-3 py-3 text-left">
                        Freight
                      </th>

                      <th className="px-3 py-3 text-left min-w-[220px]">
                        Consignee
                      </th>

                      <th className="px-3 py-3 text-left min-w-[180px]">
                        P.Marka
                      </th>

                      <th className="px-3 py-3 text-left min-w-[220px]">
                        Item
                      </th>

                      <th className="px-3 py-3 text-left min-w-[150px]">
                        Payment
                      </th>

                      <th className="px-3 py-3 text-left">
                        Status
                      </th>

                    </tr>
                  </thead>

                  {/* TABLE BODY */}
                  <tbody className="divide-y">

                    {rows.map((row) => {
                      const rowDetails =
                        details[row.id];

                      /**
                       * Find automatically matched customer
                       */
                      const consignee =
                        customers.find(
                          (customer) =>
                            customer.id ===
                            rowDetails?.consigneeId
                        );

                      return (
                        <tr
                          key={row.id}
                          className={
                            row.imported
                              ? "bg-gray-50 text-gray-400"
                              : "hover:bg-blue-50"
                          }
                        >

                          {/* CHECKBOX */}
                          <td className="px-3 py-3 text-center">
                            <input
                              type="checkbox"
                              disabled={
                                row.imported
                              }
                              checked={selectedIds.includes(
                                row.id
                              )}
                              onChange={() =>
                                toggleRow(
                                  row.id
                                )
                              }
                            />
                          </td>

                          {/* S.NO */}
                          <td className="px-3 py-3">
                            {row.serialNo}
                          </td>

                          {/* LR */}
                          <td className="px-3 py-3 font-medium">
                            {row.lrNo || "-"}
                          </td>

                          {/* DATE */}
                          <td className="px-3 py-3">
                            {row.biltyDate ||
                              "-"}
                          </td>

                          {/* PACKAGES */}
                          <td className="px-3 py-3">
                            {row.packages ??
                              "-"}
                          </td>

                          {/* WEIGHT */}
                          <td className="px-3 py-3">
                            {row.weight ??
                              "-"}
                          </td>

                          {/* FREIGHT */}
                          <td className="px-3 py-3">
                            ₹
                            {row.freight ??
                              0}
                          </td>

                          {/* --------------------------------
                              CONSIGNEE
                          --------------------------------- */}
                          <td className="px-3 py-3">
                            <div className="min-w-[200px]">

                             <div>
  <p className="font-medium text-gray-900">
    {rowDetails?.consigneeName ||
      row.consigneeName ||
      row.consignee ||
      "Unknown Consignee"}
  </p>

  {consignee ? (
    <p className="text-xs text-gray-500">
      {consignee.customerCode}
    </p>
  ) : (
    <p className="text-xs text-gray-500">
      Customer master mein nahi hai — Bilty mein naam save hoga
    </p>
  )}
</div>

                            </div>
                          </td>

                          {/* --------------------------------
                              P.MARKA
                          --------------------------------- */}
                          <td className="px-3 py-3">
                            <input
                              type="text"
                              disabled={
                                row.imported
                              }
                              value={
                                rowDetails?.pMarka ??
                                ""
                              }
                              onChange={(e) =>
                                updateDetails(
                                  row.id,
                                  "pMarka",
                                  e.target.value
                                )
                              }
                              placeholder="P.Marka"
                              className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                          </td>

                          {/* --------------------------------
                              ITEM
                          --------------------------------- */}
                          <td className="px-3 py-3">
                            <input
                              type="text"
                              disabled={
                                row.imported
                              }
                              value={
                                rowDetails?.goodsDescription ??
                                ""
                              }
                              onChange={(e) =>
                                updateDetails(
                                  row.id,
                                  "goodsDescription",
                                  e.target.value
                                )
                              }
                              placeholder="Item"
                              className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                          </td>

                          {/* --------------------------------
                              PAYMENT
                          --------------------------------- */}
                          <td className="px-3 py-3">
                            <select
                              disabled={
                                row.imported
                              }
                              value={
                                rowDetails?.paymentType ??
                                ""
                              }
                              onChange={(e) =>
                                updateDetails(
                                  row.id,
                                  "paymentType",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                              <option value="">
                                Select
                              </option>

                              <option value="PAID">
                                PAID
                              </option>

                              <option value="TO_PAY">
                                TO PAY
                              </option>

                              <option value="BILLING">
  BILLING
</option>
                            </select>
                          </td>

                          {/* --------------------------------
                              STATUS
                          --------------------------------- */}
                          <td className="px-3 py-3">
                            {row.imported ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                                <CheckCircle2
                                  size={13}
                                />

                                Imported
                              </span>
                            ) : (
                              <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                                Pending
                              </span>
                            )}
                          </td>

                        </tr>
                      );
                    })}

                  </tbody>
                </table>
              </div>
            </>
          )}

        </div>

        {/* -------------------------------------------
            FOOTER
        -------------------------------------------- */}
        <div className="flex flex-col gap-3 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-sm text-gray-500">
            {selectedIds.length} Bilty selected
          </p>

          <div className="flex justify-end gap-3">

            <button
              type="button"
              onClick={onClose}
              disabled={importing}
              className="rounded-lg border px-5 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleImport}
             disabled={
  importing ||
  selectedIds.length === 0
}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {importing && (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              )}

              {importing
                ? "Importing..."
                : `Import ${selectedIds.length} Bilty`}
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}