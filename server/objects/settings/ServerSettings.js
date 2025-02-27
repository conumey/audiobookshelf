const { BookCoverAspectRatio, BookshelfView } = require('../../utils/constants')
const { isNullOrNaN } = require('../../utils')
const Logger = require('../../Logger')

class ServerSettings {
  constructor(settings) {
    this.id = 'server-settings'
    this.tokenSecret = null

    // Scanner
    this.scannerParseSubtitle = false
    this.scannerFindCovers = false
    this.scannerCoverProvider = 'google'
    this.scannerPreferAudioMetadata = false
    this.scannerPreferOpfMetadata = false
    this.scannerPreferMatchedMetadata = false
    this.scannerDisableWatcher = false
    this.scannerPreferOverdriveMediaMarker = false
    this.scannerUseSingleThreadedProber = true
    this.scannerMaxThreads = 0 // Currently not being used
    this.scannerUseTone = false

    // Metadata - choose to store inside users library item folder
    this.storeCoverWithItem = false
    this.storeMetadataWithItem = false

    // Security/Rate limits
    this.rateLimitLoginRequests = 10
    this.rateLimitLoginWindow = 10 * 60 * 1000 // 10 Minutes

    // Backups
    // this.backupSchedule = '30 1 * * *' // If false then auto-backups are disabled (default every day at 1:30am)
    this.backupSchedule = false
    this.backupsToKeep = 2
    this.maxBackupSize = 1
    this.backupMetadataCovers = true

    // Logger
    this.loggerDailyLogsToKeep = 7
    this.loggerScannerLogsToKeep = 2

    // Cover
    // TODO: Remove after mobile apps are configured to use library server settings
    this.coverAspectRatio = BookCoverAspectRatio.SQUARE

    // Bookshelf Display
    this.homeBookshelfView = BookshelfView.STANDARD
    this.bookshelfView = BookshelfView.STANDARD

    // Podcasts
    this.podcastEpisodeSchedule = '0 * * * *' // Every hour

    // Sorting
    this.sortingIgnorePrefix = false
    this.sortingPrefixes = ['the', 'a']

    // Misc Flags
    this.chromecastEnabled = false
    this.enableEReader = false
    this.dateFormat = 'MM/dd/yyyy'

    this.logLevel = Logger.logLevel

    this.version = null

    if (settings) {
      this.construct(settings)
    }
  }

  construct(settings) {
    this.tokenSecret = settings.tokenSecret
    this.scannerFindCovers = !!settings.scannerFindCovers
    this.scannerCoverProvider = settings.scannerCoverProvider || 'google'
    this.scannerParseSubtitle = settings.scannerParseSubtitle
    this.scannerPreferAudioMetadata = !!settings.scannerPreferAudioMetadata
    this.scannerPreferOpfMetadata = !!settings.scannerPreferOpfMetadata
    this.scannerPreferMatchedMetadata = !!settings.scannerPreferMatchedMetadata
    this.scannerDisableWatcher = !!settings.scannerDisableWatcher
    this.scannerPreferOverdriveMediaMarker = !!settings.scannerPreferOverdriveMediaMarker
    this.scannerUseSingleThreadedProber = !!settings.scannerUseSingleThreadedProber
    if (settings.scannerUseSingleThreadedProber === undefined) { // Default to original scanner
      this.scannerUseSingleThreadedProber = true
    }
    this.scannerMaxThreads = isNullOrNaN(settings.scannerMaxThreads) ? 0 : Number(settings.scannerMaxThreads)
    this.scannerUseTone = !!settings.scannerUseTone

    this.storeCoverWithItem = !!settings.storeCoverWithItem
    this.storeMetadataWithItem = !!settings.storeMetadataWithItem

    this.rateLimitLoginRequests = !isNaN(settings.rateLimitLoginRequests) ? Number(settings.rateLimitLoginRequests) : 10
    this.rateLimitLoginWindow = !isNaN(settings.rateLimitLoginWindow) ? Number(settings.rateLimitLoginWindow) : 10 * 60 * 1000 // 10 Minutes

    this.backupSchedule = settings.backupSchedule || false
    this.backupsToKeep = settings.backupsToKeep || 2
    this.maxBackupSize = settings.maxBackupSize || 1
    this.backupMetadataCovers = settings.backupMetadataCovers !== false

    this.loggerDailyLogsToKeep = settings.loggerDailyLogsToKeep || 7
    this.loggerScannerLogsToKeep = settings.loggerScannerLogsToKeep || 2

    this.coverAspectRatio = !isNaN(settings.coverAspectRatio) ? settings.coverAspectRatio : BookCoverAspectRatio.SQUARE
    this.homeBookshelfView = settings.homeBookshelfView || BookshelfView.STANDARD
    this.bookshelfView = settings.bookshelfView || BookshelfView.STANDARD

    this.sortingIgnorePrefix = !!settings.sortingIgnorePrefix
    this.sortingPrefixes = settings.sortingPrefixes || ['the', 'a']
    this.chromecastEnabled = !!settings.chromecastEnabled
    this.enableEReader = !!settings.enableEReader
    this.dateFormat = settings.dateFormat || 'MM/dd/yyyy'
    this.logLevel = settings.logLevel || Logger.logLevel
    this.version = settings.version || null

    // Migrations
    if (settings.storeCoverWithBook != undefined) { // storeCoverWithBook was renamed to storeCoverWithItem in 2.0.0
      this.storeCoverWithItem = !!settings.storeCoverWithBook
    }
    if (settings.storeMetadataWithBook != undefined) { // storeMetadataWithBook was renamed to storeMetadataWithItem in 2.0.0
      this.storeMetadataWithItem = !!settings.storeMetadataWithBook
    }
    if (settings.homeBookshelfView == undefined) { // homeBookshelfView was added in 2.1.3
      this.homeBookshelfView = settings.bookshelfView
    }

    if (this.logLevel !== Logger.logLevel) {
      Logger.setLogLevel(this.logLevel)
    }
  }

  toJSON() { // Use toJSONForBrowser if sending to client
    return {
      id: this.id,
      tokenSecret: this.tokenSecret, // Do not return to client
      scannerFindCovers: this.scannerFindCovers,
      scannerCoverProvider: this.scannerCoverProvider,
      scannerParseSubtitle: this.scannerParseSubtitle,
      scannerPreferAudioMetadata: this.scannerPreferAudioMetadata,
      scannerPreferOpfMetadata: this.scannerPreferOpfMetadata,
      scannerPreferMatchedMetadata: this.scannerPreferMatchedMetadata,
      scannerDisableWatcher: this.scannerDisableWatcher,
      scannerPreferOverdriveMediaMarker: this.scannerPreferOverdriveMediaMarker,
      scannerUseSingleThreadedProber: this.scannerUseSingleThreadedProber,
      scannerMaxThreads: this.scannerMaxThreads,
      scannerUseTone: this.scannerUseTone,
      storeCoverWithItem: this.storeCoverWithItem,
      storeMetadataWithItem: this.storeMetadataWithItem,
      rateLimitLoginRequests: this.rateLimitLoginRequests,
      rateLimitLoginWindow: this.rateLimitLoginWindow,
      backupSchedule: this.backupSchedule,
      backupsToKeep: this.backupsToKeep,
      maxBackupSize: this.maxBackupSize,
      backupMetadataCovers: this.backupMetadataCovers,
      loggerDailyLogsToKeep: this.loggerDailyLogsToKeep,
      loggerScannerLogsToKeep: this.loggerScannerLogsToKeep,
      coverAspectRatio: this.coverAspectRatio,
      homeBookshelfView: this.homeBookshelfView,
      bookshelfView: this.bookshelfView,
      sortingIgnorePrefix: this.sortingIgnorePrefix,
      sortingPrefixes: [...this.sortingPrefixes],
      chromecastEnabled: this.chromecastEnabled,
      enableEReader: this.enableEReader,
      dateFormat: this.dateFormat,
      logLevel: this.logLevel,
      version: this.version
    }
  }

  toJSONForBrowser() {
    const json = this.toJSON()
    delete json.tokenSecret
    return json
  }

  update(payload) {
    var hasUpdates = false
    for (const key in payload) {
      if (key === 'sortingPrefixes' && payload[key] && payload[key].length) {
        var prefixesCleaned = payload[key].filter(prefix => !!prefix).map(prefix => prefix.toLowerCase())
        if (prefixesCleaned.join(',') !== this[key].join(',')) {
          this[key] = [...prefixesCleaned]
          hasUpdates = true
        }
      } else if (this[key] !== payload[key]) {
        if (key === 'logLevel') {
          Logger.setLogLevel(payload[key])
        }
        this[key] = payload[key]
        hasUpdates = true
      }
    }
    return hasUpdates
  }
}
module.exports = ServerSettings