import { BannerClient } from 'db://admob/ads/client/BannerClient'
import { BannerSize } from 'db://admob/misc/BannerSize'
import { BannerAlignment, BottomCenter } from 'db://admob/misc/BannerAlignment'
import { BannerSizeType } from 'db://admob/misc/BannerSizeType'

const BANNER_UNIT_ID = 'ca-app-pub-3940256099942544/9214589741'
// 'ca-app-pub-7685009584349373/4809089686'

export class AdManager {
  private static _instance: AdManager
  private banner: BannerClient | null = null

  public static get Instance() {
    if (!this._instance) {
      this._instance = new AdManager()
    }
    return this._instance
  }

  public initBanner() {
    if (this.banner) return

    this.banner = new BannerClient()
    this.banner.load(
      BANNER_UNIT_ID,
      {
        onAdLoaded: () => {
          this.banner?.show(true)
        },
        onAdFailedToLoad: err => {
          console.error('Banner load failed:', err)
        },
        onAdImpression: () => {
          console.log('Banner impression')
        },
        onAdClicked: () => {
          console.log('Banner clicked')
        },
      },
      {
        type: BannerSizeType.Portrait,
        size: BannerSize.BANNER,
        alignments: BottomCenter,
      },
    )
  }

  public hideBanner() {
    this.banner?.show(false)
  }

  public showBanner() {
    this.banner?.show(true)
  }

  public destroy() {
    this.banner?.destroy()
    this.banner = null
    AdManager._instance = null
  }
}
