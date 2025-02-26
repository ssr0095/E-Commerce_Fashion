import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const ProductDetailsDrop = () => {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>Product details</AccordionTrigger>
        <AccordionContent>
          <div className="text-sm text-gray-500 flex flex-col gap-1">
            <p>100% Original product.</p>
            <p>Cash on delivery is not available on this product.</p>
            {/* <p>Easy return and exchange policy within 7 days.</p> */}
            <p>
              Wash care: Machine wash in cold water, Use a mild detergent, Dry
              in the shade, and do not iron directly or scrub on print.
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Delivery & Returns</AccordionTrigger>
        <AccordionContent>
          <div className="text-sm text-gray-500 flex flex-col gap-1">
            <p>This item is not eligible for return or exchange.</p>

            <p className="underline">Return & Exchange Policy</p>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Disclaimer</AccordionTrigger>
        <AccordionContent>
          <div className="text-sm text-gray-500 flex flex-col gap-1">
            <p>
              The colour of the product may vary slightly from how it appears
              here. This may be due to different display settings on various
              devices and also because of any lighting filters or special
              effects used during the shoot.
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ProductDetailsDrop;
