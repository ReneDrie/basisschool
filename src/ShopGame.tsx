import { useState } from 'react';
import { Check, RotateCcw, ShoppingBasket, Undo2 } from 'lucide-react';
import { Art } from './Art';
import { moneyLabel, shopProducts, shopResponse, type ShopTask } from './learning/shop';

function Coin({ cents }: { cents: number }) {
  return (
    <span className={`shop-coin ${cents >= 100 ? 'euro' : 'cent'}`}>
      <strong>{cents >= 100 ? cents / 100 : cents}</strong>
      <small>{cents >= 100 ? 'euro' : 'cent'}</small>
    </span>
  );
}
export function ShopGame({ task, correct, onAnswer }: { task: ShopTask; correct: boolean; onAnswer: (value: string) => void }) {
  const [products, setProducts] = useState<string[]>([]),
    [coins, setCoins] = useState<number[]>([]);
  const reset = () => {
    setProducts([]);
    setCoins([]);
  };
  return (
    <div className={`shop-game shop-${task.kind}`}>
      <div className="shop-canopy" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="shop-sign">
        <ShoppingBasket size={20} />
        <strong>Eilandwinkel</strong>
        <Art kind="fox" />
      </div>
      {task.kind === 'compare' ? (
        <div className="shop-baskets" role="group" aria-label="Kies een mandje">
          {(['links', 'rechts'] as const).map((side, index) => (
            <button
              key={side}
              className="shop-compare-basket"
              disabled={correct}
              aria-label={`Mandje ${side}, ${index === 0 ? task.left : task.right} ${task.product.plural}`}
              onClick={() => onAnswer(side)}
            >
              <span className="shop-basket-items">
                {Array.from({ length: index === 0 ? task.left : task.right }, (_, i) => (
                  <Art kind={task.product.art} key={i} />
                ))}
              </span>
              <span className="basket-rim">
                <ShoppingBasket size={23} />
                {index === 0 ? 'Mandje 1' : 'Mandje 2'}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <>
          {task.kind === 'pack' ? (
            <>
              <div className="shop-stock" role="group" aria-label="Kies je producten">
                {shopProducts.map((product) => (
                  <button
                    key={product.id}
                    disabled={correct || products.length >= 12}
                    aria-label={`Pak een ${product.name}`}
                    onClick={() => setProducts((current) => (current.length < 12 ? [...current, product.id] : current))}
                  >
                    <Art kind={product.art} />
                    <span>{product.name}</span>
                    <b aria-hidden="true">+</b>
                  </button>
                ))}
              </div>
              <div className="shop-cart">
                <div className="shop-cart-heading">
                  <ShoppingBasket size={23} />
                  <strong>Jouw mandje</strong>
                  {/* The number stays hidden on screen: counting is the exercise. */}
                  <span className="sr-only" aria-live="polite">
                    {products.length} {products.length === 1 ? 'ding' : 'spullen'} in je mandje
                  </span>
                </div>
                <div className="shop-cart-items" role="group" aria-label="Jouw boodschappen">
                  {products.length ? (
                    products.map((id, index) => {
                      const product = shopProducts.find((p) => p.id === id)!;
                      return (
                        <button
                          key={index}
                          disabled={correct}
                          aria-label={`Leg ${product.name} ${index + 1} terug`}
                          onClick={() => setProducts((current) => current.filter((_, i) => i !== index))}
                        >
                          <Art kind={product.art} />
                          <span aria-hidden="true">−</span>
                        </button>
                      );
                    })
                  ) : (
                    <span className="shop-empty">Tik op wat je wilt pakken.</span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="shop-order" role="group" aria-label="Je boodschappen">
                {task.items.map((item) => (
                  <div className="shop-order-item" key={item.product.id}>
                    <Art kind={item.product.art} />
                    <strong>
                      {item.quantity} {item.quantity === 1 ? item.product.name : item.product.plural}
                    </strong>
                    <span>
                      {item.quantity} × {moneyLabel(item.cents)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="shop-wallet" role="group" aria-label="Kies je munten">
                {task.coins.map((cents) => (
                  <button
                    key={cents}
                    aria-label={`Leg ${cents >= 100 ? `${cents / 100} euro` : `${cents} cent`} neer`}
                    disabled={correct || coins.length >= 20}
                    onClick={() => setCoins((current) => (current.length < 20 ? [...current, cents] : current))}
                  >
                    <Coin cents={cents} />
                    <span aria-hidden="true">+</span>
                  </button>
                ))}
              </div>
              <div className="shop-cart">
                <div className="shop-cart-heading">
                  <strong>Op de toonbank</strong>
                  <span aria-live="polite">{moneyLabel(coins.reduce((a, b) => a + b, 0))}</span>
                </div>
                <div className="shop-cart-items shop-payment" role="group" aria-label="Jouw betaling">
                  {coins.length ? (
                    coins.map((cents, index) => (
                      <button
                        key={index}
                        aria-label={`Neem munt ${index + 1} van ${moneyLabel(cents)} terug`}
                        disabled={correct}
                        onClick={() => setCoins((current) => current.filter((_, i) => i !== index))}
                      >
                        <Coin cents={cents} />
                        <span aria-hidden="true">−</span>
                      </button>
                    ))
                  ) : (
                    <span className="shop-empty">Leg hier je munten neer.</span>
                  )}
                </div>
              </div>
            </>
          )}
          <div className="shop-controls">
            <button className="shop-reset" disabled={correct || !(products.length || coins.length)} onClick={reset}>
              <RotateCcw size={17} />
              Opnieuw
            </button>
            <button
              className="primary-button shop-submit"
              disabled={correct || !(products.length || coins.length)}
              onClick={() => onAnswer(shopResponse(task, products, coins))}
            >
              {correct ? <Check size={21} /> : <ShoppingBasket size={21} />} {task.kind === 'pack' ? 'Mandje klaar' : 'Betalen'}
            </button>
          </div>
          <p className="shop-undo">
            <Undo2 size={14} />
            {task.kind === 'pack' ? 'Tik op je boodschappen om ze terug te leggen.' : 'Tik op een munt om die terug te nemen.'}
          </p>
        </>
      )}
    </div>
  );
}
