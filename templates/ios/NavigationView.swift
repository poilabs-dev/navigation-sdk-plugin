import UIKit
import PoilabsNavigation

class NavigationView: UIView, PLNNavigationMapViewDelegate {

  private var mapView: PLNNavigationMapView?

  @objc var applicationId: NSString = "" {
    didSet {
      PLNNavigationSettings.sharedInstance().applicationId = applicationId as String
    }
  }
  @objc var applicationSecret: NSString = "" {
    didSet {
      PLNNavigationSettings.sharedInstance().applicationSecret = applicationSecret as String
    }
  }
  @objc var uniqueId: NSString = "" {
    didSet {
      PLNNavigationSettings.sharedInstance().navigationUniqueIdentifier = uniqueId as String
    }
  }
  @objc var language: NSString = "en" {
    didSet {
      PLNNavigationSettings.sharedInstance().applicationLanguage = language as String
      reloadMap()
    }
  }
  @objc var showOnMap: NSString?
  @objc var getRouteTo: NSString?

  override init(frame: CGRect) {
    super.init(frame: frame)
    setupMap()
  }

  required init?(coder: NSCoder) {
    super.init(coder: coder)
    setupMap()
  }

  private func setupMap() {
    NotificationCenter.default.addObserver(self, selector: #selector(showPoint(_:)), name: NSNotification.Name("showPoint"), object: nil)
    NotificationCenter.default.addObserver(self, selector: #selector(routeTo(_:)), name: NSNotification.Name("routeTo"), object: nil)
    reloadMap()
  }

  private func reloadMap() {
    mapView?.removeFromSuperview()
    PLNavigationManager.sharedInstance()?.getReadyForStoreMap(completionHandler: { error in
      guard error == nil else { return }
      let mv = PLNNavigationMapView(frame: self.bounds)
      mv.delegate = self
      self.mapView = mv
      self.addSubview(mv)
    })
  }

  @objc private func showPoint(_ notification: Notification) {
    guard let storeId = notification.userInfo?["storeId"] as? String else { return }
    mapView?.getShowonMapPin(storeId)
  }

  @objc private func routeTo(_ notification: Notification) {
    guard let storeId = notification.userInfo?["storeId"] as? String else { return }
    mapView?.navigateWithStoreId(to: storeId)
  }

  func childsAreReady() {
    if let id = showOnMap as String? {
      mapView?.getShowonMapPin(id)
    } else if let id = getRouteTo as String? {
      mapView?.navigateWithStoreId(to: id)
    }
  }

  deinit {
    NotificationCenter.default.removeObserver(self)
  }
}