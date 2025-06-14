import useOrderContainer from "@commercelayer/react-components/hooks/useOrderContainer"
import LineItemsContainer from "@commercelayer/react-components/line_items/LineItemsContainer"
import LineItemsCount from "@commercelayer/react-components/line_items/LineItemsCount"
import AdjustmentAmount from "@commercelayer/react-components/orders/AdjustmentAmount"
import DiscountAmount from "@commercelayer/react-components/orders/DiscountAmount"
import GiftCardAmount from "@commercelayer/react-components/orders/GiftCardAmount"
import PaymentMethodAmount from "@commercelayer/react-components/orders/PaymentMethodAmount"
import ShippingAmount from "@commercelayer/react-components/orders/ShippingAmount"
import SubTotalAmount from "@commercelayer/react-components/orders/SubTotalAmount"
import TaxesAmount from "@commercelayer/react-components/orders/TaxesAmount"
import TotalAmount from "@commercelayer/react-components/orders/TotalAmount"
import { Trans, useTranslation } from "react-i18next"

import { AppProviderData } from "components/data/AppProvider"
import { LINE_ITEMS_SHOPPABLE } from "components/utils/constants"

import { CouponOrGiftCard } from "./CouponOrGiftCard"
import { LineItemTypes } from "./LineItemTypes"
import { ReturnToCart } from "./ReturnToCart"

interface Props {
  appCtx: AppProviderData
  readonly?: boolean
}

export const OrderSummary: React.FC<Props> = ({ appCtx, readonly }) => {
  const { t } = useTranslation()

  const isTaxCalculated = appCtx.isShipmentRequired
    ? appCtx.hasBillingAddress &&
      appCtx.hasShippingAddress &&
      appCtx.hasShippingMethod
    : appCtx.hasBillingAddress

  const { order } = useOrderContainer()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    return `${day}/${month}/${year} ${hours}:${minutes}`
  }

  return (
    <div className="w-full max-w-4xl p-4 mx-auto" data-testid="order-summary">
      <LineItemsContainer>
        {!readonly && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold">
              {t("orderRecap.order_summary")}
            </h2>
            <p className="text-sm text-gray-600">
              <LineItemsCount typeAccepted={LINE_ITEMS_SHOPPABLE}>
                {(props) =>
                  t("orderRecap.cartContains", { count: props.quantity })
                }
              </LineItemsCount>
            </p>
          </div>
        )}
        {LINE_ITEMS_SHOPPABLE.map((type) => (
          <LineItemTypes type={type} key={type} />
        ))}
      </LineItemsContainer>

      {order?.line_items?.[0]?.metadata?.bookingData &&
        (() => {
          const booking = order.line_items[0].metadata.bookingData
          const vehicle = booking.step_1?.[0]?.metadata
          const extras = booking.step_2 || []
          const accessories = booking.step_3 || []
          const assurance = booking.assurancePack
          const totalPrice = booking.totalPrice

          return (
            <div className="p-4 mb-6 bg-white border border-gray-200 rounded-lg shadow-sm">
              <h3 className="mb-4 text-xl font-bold text-gray-800">
                {t("orderRecap.bookingDetails", "Detalhes da Reserva")}
              </h3>

              <div className="text-sm text-gray-700 space-y-3">
                <p>
                  <strong>Período:</strong> {formatDate(vehicle.start_Date)} até{" "}
                  {formatDate(vehicle.end_Date)} ({vehicle.number_of_days} dias)
                </p>
                <p>
                  <strong>Recolha / Entrega:</strong> {vehicle.pick_location}
                </p>

                <div className="flex flex-col gap-1">
                  <p>
                    <strong>Veículo:</strong> {vehicle.vehicleModel} (
                    {vehicle.vehicle_registration_number})
                  </p>
                  {vehicle.modelImage && (
                    <img
                      src={vehicle.modelImage}
                      alt={vehicle.vehicleModel}
                      className="object-cover h-auto my-2 border border-gray-200 rounded-md max-w-[120px]"
                    />
                  )}
                  <div className="flex items-center justify-between text-base">
                    <span className="font-medium">Preço base:</span>
                    <span className="font-semibold text-gray-900">
                      {(vehicle.total_amount_cents / 100).toFixed(2)} €
                    </span>
                  </div>
                </div>

                {extras.length > 0 && (
                  <div className="pt-3 mt-3 border-t border-gray-100">
                    <strong className="text-base">Extras:</strong>
                    <ul className="mt-1 list-none space-y-1">
                      {extras.map((extra) => (
                        <li
                          key={extra.id}
                          className="flex items-center justify-between"
                        >
                          <span>{extra.title}</span>
                          <span className="font-semibold text-gray-900">
                            {(extra.price_amount_cents / 100).toFixed(2)} €
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {accessories.length > 0 && (
                  <div className="pt-3 mt-3 border-t border-gray-100">
                    <strong className="text-base">Acessórios:</strong>
                    <ul className="mt-1 list-none space-y-1">
                      {accessories.map((acc, i) => (
                        <li
                          key={i}
                          className="flex items-center justify-between"
                        >
                          <span>{acc.title}</span>
                          <span className="font-semibold text-gray-900">
                            {acc.pricing.toFixed(2)} €
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {assurance && (
                  <div className="pt-3 mt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <strong className="text-base">Pacote de Seguro:</strong>
                      <span className="font-semibold text-gray-900">
                        {assurance.packagePriceBasedOnDays.toFixed(2)} €
                      </span>
                    </div>
                    <span className="block text-gray-600">
                      {assurance.packageDetails.title}
                    </span>
                    <small className="block mt-1 text-gray-500">
                      {assurance.packageDetails.description}
                    </small>
                    <ul className="mt-2 text-xs text-gray-600 list-disc list-inside space-y-0.5">
                      {assurance.packageDetails.includedCoverages.map(
                        (cov, i) => (
                          <li key={i}>
                            <strong>{cov.title}:</strong> {cov.description}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 mt-6 border-t border-gray-200">
                <span className="text-xl font-bold text-gray-800">
                  Total da reserva:
                </span>
                <span className="text-2xl font-extrabold text-indigo-600">
                  {totalPrice.toFixed(2)} €
                </span>
              </div>
            </div>
          )
        })()}

      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm space-y-3">
        <CouponOrGiftCard
          readonly={readonly}
          setCouponOrGiftCard={appCtx.setCouponOrGiftCard}
        />

        <div className="flex items-center justify-between text-base text-gray-700">
          <span>{t("orderRecap.subtotal_amount")}</span>
          <SubTotalAmount className="font-semibold text-gray-900" />
        </div>
        <DiscountAmount>
          {(props) =>
            props.priceCents !== 0 && (
              <div className="flex items-center justify-between text-base text-gray-700">
                <span>{t("orderRecap.discount_amount")}</span>
                <span className="font-semibold text-gray-900">
                  {props.price}
                </span>
              </div>
            )
          }
        </DiscountAmount>
        <AdjustmentAmount>
          {(props) =>
            props.priceCents !== 0 && (
              <div className="flex items-center justify-between text-base text-gray-700">
                <span>{t("orderRecap.adjustment_amount")}</span>
                <span className="font-semibold text-gray-900">
                  {props.price}
                </span>
              </div>
            )
          }
        </AdjustmentAmount>
        <ShippingAmount>
          {(props) =>
            appCtx.isShipmentRequired && (
              <div className="flex items-center justify-between text-base text-gray-700">
                <span>{t("orderRecap.shipping_amount")}</span>
                <span className="font-semibold text-gray-900">
                  {!appCtx.hasShippingMethod
                    ? t("orderRecap.notSet")
                    : props.priceCents === 0
                      ? t("general.free")
                      : props.price}
                </span>
              </div>
            )
          }
        </ShippingAmount>
        <PaymentMethodAmount>
          {(props) =>
            props.priceCents !== 0 && (
              <div className="flex items-center justify-between text-base text-gray-700">
                <span>{t("orderRecap.payment_method_amount")}</span>
                <span className="font-semibold text-gray-900">
                  {props.price}
                </span>
              </div>
            )
          }
        </PaymentMethodAmount>
        <TaxesAmount>
          {(props) => (
            <div className="flex items-center justify-between text-base text-gray-700">
              <span>
                <Trans
                  i18nKey={
                    isTaxCalculated && appCtx.taxIncluded
                      ? "orderRecap.tax_included_amount"
                      : "orderRecap.tax_amount"
                  }
                />
              </span>
              <span className="font-semibold text-gray-900">
                {isTaxCalculated ? props.price : t("orderRecap.notSet")}
              </span>
            </div>
          )}
        </TaxesAmount>
        <GiftCardAmount>
          {(props) =>
            props.priceCents !== 0 && (
              <div className="flex items-center justify-between text-base text-gray-700">
                <span>{t("orderRecap.giftcard_amount")}</span>
                <span className="font-semibold text-gray-900">
                  {props.price}
                </span>
              </div>
            )
          }
        </GiftCardAmount>

        <div className="flex items-center justify-between pt-3 mt-4 border-t border-gray-200">
          <span className="text-xl font-bold text-gray-800">
            {t("orderRecap.total_amount")}
          </span>
          <TotalAmount className="text-3xl font-extrabold text-blue-700" />
        </div>

        {!appCtx.isComplete && <ReturnToCart cartUrl={appCtx.cartUrl} />}
      </div>
    </div>
  )
}
