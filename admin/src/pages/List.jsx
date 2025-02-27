import axios from "axios";
import React, { useEffect, useState } from "react";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import Edit from "./Edit";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [productId, setProductId] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const fetchList = async () => {
    try {
      const response = await axios.get(
        backendUrl + `/api/product/list?admin=${true}`
      );
      if (response.data.success) {
        setList(response.data.products.reverse());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const removeProduct = async () => {
    try {
      const response = await axios.post(
        backendUrl + "/api/product/remove",
        { id: productId },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="w-full max-sm:px-6 overflow-x-scroll relative">
      <p className="mb-2">All Products List</p>
      <div className="flex flex-col min-w-[560px] overflow-x-scroll md:min-w-[80%] no-scrollbar">
        <div className="w-full sticky top-0 left-0 grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr] items-center py-2 px-4 border-b-2  bg-white text-sm">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Edit</b>
          <b>Remove</b>
        </div>

        {list.map((item, index) => (
          <div
            className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr] items-center py-2 px-4 border-b text-sm hover:bg-gray-50 bg-white"
            key={index}
          >
            <img
              className="size-12"
              width={48}
              height={48}
              src={item.image[0]}
              alt="cloth"
            />
            <p>{item.name}</p>
            <p>{item.category}</p>
            <p>
              {currency}
              {item.price}
            </p>
            <div
              className="flex items-center justify-center cursor-default size-8 p-2 rounded-full text-gray-600 hover:bg-gray-200"
              onClick={() => {
                setProductId(item._id);
                setEditDialogOpen(true);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-pencil"
              >
                <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                <path d="m15 5 4 4" />
              </svg>
            </div>
            <div
              className="flex items-center justify-center cursor-default size-8 p-2 rounded-full text-gray-600 hover:bg-gray-200"
              onClick={() => {
                setProductId(item._id);
                setDeleteDialogOpen(true);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-trash-2"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1="10" x2="10" y1="11" y2="17" />
                <line x1="14" x2="14" y1="11" y2="17" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="w-[80%] rounded-lg">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this product?</p>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={removeProduct}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {/* <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}> */}
      <Dialog>
        <DialogContent className="max-w-fit overflow-scroll h-[80%] rounded-lg">
          <Edit
            token={token}
            id={productId}
            setEditDialogOpen={setEditDialogOpen}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default List;
