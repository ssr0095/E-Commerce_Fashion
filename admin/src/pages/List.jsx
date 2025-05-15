import { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { Trash2, Pencil } from "lucide-react";
import Edit from "./Edit";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Loader from "../components/CompLoader";

const List = ({ token, setToken }) => {
  const [list, setList] = useState([]);
  const [productId, setProductId] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchList = async (forceRefresh = false) => {
    setIsLoading(true);
    const cacheKey = "cachedProductList";
    const cacheTimeKey = "cachedProductListTime";
    const cacheExpiry = 5 * 60 * 1000;

    const now = Date.now();
    const cachedData = localStorage.getItem(cacheKey);
    const cachedTime = localStorage.getItem(cacheTimeKey);

    if (
      !forceRefresh &&
      cachedData &&
      cachedTime &&
      now - cachedTime < cacheExpiry
    ) {
      setList(JSON.parse(cachedData));
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${backendUrl}/api/product/list?admin=true`
      );
      setIsLoading(false);
      if (response.data.success) {
        const reversed = response.data.products.reverse();
        setList(reversed);
        localStorage.setItem(cacheKey, JSON.stringify(reversed));
        localStorage.setItem(cacheTimeKey, now.toString());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      setIsLoading(false);
      toast.error(error.message);
      if (error.status == 401) {
        setToken("");
        localStorage.removeItem("token");
        window.location.reload();
      }
    }
  };

  const removeProduct = async () => {
    setIsLoading(true);
    try {
      const response = await axios.delete(`${backendUrl}/api/product/remove`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: { id: productId }, // This is how you send data with DELETE
      });
      setIsLoading(false);

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList(true); // force refresh cache
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
      if (error.status == 401) {
        setToken("");
        window.location.reload();
      }
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="w-full max-sm:px-6 overflow-x-auto relative">
      <p className="mb-2">All Products List</p>
      {isLoading && <Loader />}
      {list?.length === 0 ? (
        <div className="w-full text-center py-10 text-gray-500">
          No product found
        </div>
      ) : (
        <>
          <div className="flex flex-col min-w-[560px] md:min-w-[80%] no-scrollbar">
            <div className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr] px-4 py-2 border-b-2 bg-white text-sm sticky top-0">
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
                  className="w-12 aspect-[3/4]"
                  width={48}
                  height={48}
                  src={item.image[0]}
                  alt={`${item.name} image`}
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
                    setCurrentProduct(item._id);
                    setEditDialogOpen(true);
                  }}
                >
                  <Pencil size={16} />
                </div>
                <div
                  className="flex items-center justify-center cursor-default size-8 p-2 rounded-full text-gray-600 hover:bg-gray-200"
                  onClick={() => {
                    setProductId(item._id);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 size={16} />
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
                <Button variant="default" onClick={removeProduct}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Product Dialog */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="max-sm:w-[95%] w-[80%] max-w-4xl h-[90vh] overflow-auto rounded-lg">
              <DialogHeader>
                <DialogTitle>Edit Product</DialogTitle>
              </DialogHeader>
              {currentProduct && (
                <Edit
                  token={token}
                  productId={currentProduct}
                  onClose={() => {
                    setEditDialogOpen(false);
                    setCurrentProduct(null);
                  }}
                  onUpdate={() => fetchList(true)}
                />
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default List;
