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
import useOrderContainer from "@commercelayer/react-components/hooks/useOrderContainer"

import type { AppProviderData } from "components/data/AppProvider"
import { LINE_ITEMS_SHOPPABLE } from "components/utils/constants"
import { Trans, useTranslation } from "react-i18next"

import { CouponOrGiftCard } from "./CouponOrGiftCard"
import { LineItemTypes } from "./LineItemTypes"
import { ReturnToCart } from "./ReturnToCart"
import {
  AmountSpacer,
  AmountWrapper,
  RecapLine,
  RecapLineItem,
  RecapLineItemTotal,
  RecapLineTotal,
  SummaryHeader,
  SummarySubTitle,
  SummaryTitle,
  TotalWrapper,
  Wrapper,
} from "./styled"
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, AwaitedReactNode, Key } from "react"


interface Props {
  appCtx: AppProviderData
  hideItemCodes?: NullableType<boolean>
  readonly?: boolean
}
interface BookingExtra {
    id: string
    title: string
    price_amount_cents: number
}

interface Accessory {
    title: string
    pricing: number
}

interface VehicleBookingMetadata {
    start_Date: string
    end_Date: string
    number_of_days: number
    pick_location: string
    vehicleModel: string
    vehicle_registration_number: string
    modelImage?: string
    total_amount_cents: number
}

interface AssuranceCoverage {
    title: string
    description: string
}

interface AssurancePack {
    packagePriceBasedOnDays: number
    packageDetails: {
        title: string
        description: string
        includedCoverages: AssuranceCoverage[]
    }
}

interface BookingData {
    externalPrice: JSX.Element;
    step_1: [{ metadata: VehicleBookingMetadata }]
    step_2?: BookingExtra[]
    step_3?: Accessory[]
    assurancePack?: AssurancePack
    totalPrice: number
}
export const OrderSummary: React.FC<Props> = ({
  appCtx,
  readonly,
  hideItemCodes,
}) => {
  const { t } = useTranslation()

  const isTaxCalculated = appCtx.isShipmentRequired
    ? appCtx.hasBillingAddress &&
      appCtx.hasShippingAddress &&
      appCtx.hasShippingMethod
      : appCtx.hasBillingAddress
  const {order} = useOrderContainer()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    return `${day}/${month}/${year} ${hours}:${minutes}`
  }
  const lineItems = !readonly ? (
    <SummaryHeader>
      <SummaryTitle data-testid="test-summary">
        {t("orderRecap.order_summary")}
      </SummaryTitle>
      <SummarySubTitle>
        <LineItemsCount
          data-testid="items-count"
          typeAccepted={LINE_ITEMS_SHOPPABLE}
        >
          {(props): JSX.Element => (
            <span data-testid="items-count">
              {t("orderRecap.cartContains", { count: props.quantity })}
            </span>
          )}
        </LineItemsCount>
      </SummarySubTitle>
    </SummaryHeader>
  ) : null
  return (
    <Wrapper data-testid="order-summary">
      <LineItemsContainer>
        <>
          {lineItems}
          {
            <>
              {LINE_ITEMS_SHOPPABLE.map((type) => (
                <LineItemTypes
                  type={type}
                  key={type}
                  hideItemCodes={hideItemCodes}
                />
              ))}
            </>
          }
        </>
      </LineItemsContainer>
        {order?.line_items?.[0]?.metadata?.bookingData &&
            (() => {
                const booking = order.line_items[0].metadata
                    .bookingData as BookingData
                const vehicle = booking.step_1?.[0]?.metadata
                const extras: BookingExtra[] = booking.step_2 || []
                const accessories: Accessory[] = booking.step_3 || []
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
                                <div className="flex flex-col items-end justify-between text-base">
                                    <span className="font-medium self-start">Preço base:</span>
                                    <div className="text-sm text-gray-500 text-center w-full">
                                        {vehicle.number_of_days} dias
                                        x {(vehicle.total_amount_cents / 100 / vehicle.number_of_days).toFixed(2)} €
                                    </div>
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
                            {order?.line_items?.[0]?.metadata?.bookingData?.externalPrice?.data && (
                                <div className="pt-3 mt-3 border-t border-gray-100 text-sm text-gray-700 space-y-2">
                                    <strong className="block text-base">Detalhes de Preço:</strong>

                                    {/*   Eventos Aplicados
                          {order.line_items[0].metadata.bookingData.externalPrice.data.events?.map((event, i) => (
                              <div key={i} className="flex justify-between">
                                <span>{event.params.name}</span>
                                <span className="text-right font-semibold text-gray-900">
          {event.params.percentage}%
        </span>
                              </div>
                          ))}*/}

                                    {/* Taxas Aplicadas */}
                                    {order.line_items[0].metadata.bookingData.externalPrice.data.taxasAplicadas?.length > 0 && (
                                        <>
                                            <div className="font-bold mt-2  text-gray-800">Taxas aplicadas:</div>
                                            {order.line_items[0].metadata.bookingData.externalPrice.data.taxasAplicadas.map((tax: {
                                                name: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | Iterable<ReactNode> | null | undefined;
                                                amount: number
                                            }, i: Key | null | undefined) => (
                                                <div key={i} className="flex justify-between ml-4">
                                                    <span>{tax.name}</span>
                                                    <span className="text-right font-semibold text-gray-900">
              {(tax.amount / 100).toFixed(2)} €
            </span>
                                                </div>
                                            ))}
                                        </>
                                    )}

                                    {/* Descontos Aplicados */}
                                    {order.line_items[0].metadata.bookingData.externalPrice.data.descontosAplicados?.length > 0 && (
                                        <>
                                            <div className="font-bold mt-2  text-gray-800">Descontos aplicados:</div>
                                            {order.line_items[0].metadata.bookingData.externalPrice.data.descontosAplicados.map((desc: { name: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | Iterable<ReactNode> | null | undefined; amount: number }, i: Key | null | undefined) => (
                                                <div key={i} className="flex justify-between ml-4">
                                                    <span>{desc.name}</span>
                                                    <span className="text-right font-semibold text-gray-900">
              {(desc.amount / 100).toFixed(2)} €
            </span>
                                                </div>
                                            ))}
                                        </>
                                    )}
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
      <TotalWrapper>
        <AmountSpacer />
        <AmountWrapper>
          <CouponOrGiftCard
            readonly={readonly}
            setCouponOrGiftCard={appCtx.setCouponOrGiftCard}
          />
          <RecapLine>
            <RecapLineItem>{t("orderRecap.subtotal_amount")}</RecapLineItem>
            <SubTotalAmount />
          </RecapLine>
          <DiscountAmount>
            {(props) => {
              if (props.priceCents === 0) return <></>
              return (
                <RecapLine>
                  <RecapLineItem>
                    {t("orderRecap.discount_amount")}
                  </RecapLineItem>
                  <div data-testid="discount-amount">{props.price}</div>
                </RecapLine>
              )
            }}
          </DiscountAmount>
          <AdjustmentAmount>
            {(props) => {
              if (props.priceCents === 0) return <></>
              return (
                <RecapLine>
                  <RecapLineItem>
                    {t("orderRecap.adjustment_amount")}
                  </RecapLineItem>
                  <div data-testid="adjustment-amount">{props.price}</div>
                </RecapLine>
              )
            }}
          </AdjustmentAmount>

          <ShippingAmount>
            {(props) => {
              if (!appCtx.isShipmentRequired) return <></>
              return (
                <RecapLine>
                  <RecapLineItem>
                    {t("orderRecap.shipping_amount")}
                  </RecapLineItem>
                  <div data-testid="shipping-amount">
                    {!appCtx.hasShippingMethod
                      ? t("orderRecap.notSet")
                      : props.priceCents === 0
                        ? t("general.free")
                        : props.price}
                  </div>
                </RecapLine>
              )
            }}
          </ShippingAmount>

          <PaymentMethodAmount>
            {(props) => {
              if (props.priceCents === 0) return <></>
              return (
                <RecapLine data-testid="payment-method-amount">
                  <RecapLineItem>
                    {t("orderRecap.payment_method_amount")}
                  </RecapLineItem>
                  {props.price}
                </RecapLine>
              )
            }}
          </PaymentMethodAmount>
          <RecapLine>
            <TaxesAmount>
              {(props) => {
                return (
                  <>
                    <RecapLineItem>
                      <Trans
                        i18nKey={
                          isTaxCalculated && appCtx.taxIncluded
                            ? "orderRecap.tax_included_amount"
                            : "orderRecap.tax_amount"
                        }
                        components={
                          isTaxCalculated
                            ? {
                                style: (
                                  <span
                                    className={
                                      appCtx.taxIncluded
                                        ? "text-gray-500 font-normal"
                                        : ""
                                    }
                                  />
                                ),
                              }
                            : {}
                        }
                      />
                    </RecapLineItem>
                    <div data-testid="tax-amount">
                      {isTaxCalculated ? props.price : t("orderRecap.notSet")}
                    </div>
                  </>
                )
              }}
            </TaxesAmount>
          </RecapLine>

          <GiftCardAmount>
            {(props) => {
              if (props.priceCents === 0) return <></>
              return (
                <RecapLine>
                  <RecapLineItem>
                    {t("orderRecap.giftcard_amount")}
                  </RecapLineItem>
                  <div data-testid="giftcard-amount">{props.price}</div>
                </RecapLine>
              )
            }}
          </GiftCardAmount>
          <RecapLineTotal>
            <RecapLineItemTotal>
              {t("orderRecap.total_amount")}
            </RecapLineItemTotal>
            <TotalAmount
              data-testid="total-amount"
              className="text-xl font-extrabold"
            />
          </RecapLineTotal>
          {!appCtx.isComplete && <ReturnToCart cartUrl={appCtx.cartUrl} />}
        </AmountWrapper>
      </TotalWrapper>
    </Wrapper>
  )
}
