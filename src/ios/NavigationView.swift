import UIKit
import PoilabsNavigation

@objc class NavigationView: UIView {
  
  var currentCarrier: PLNNavigationMapView?
  
  @objc var applicationId: NSString = "" {
    didSet {
      updateConfiguration()
    }
  }
  
  @objc var applicationSecret: NSString = "" {
    didSet {
      updateConfiguration()
    }
  }
  
  @objc var uniqueId: NSString = "" {
    didSet {
      updateConfiguration()
    }
  }
  
  @objc var language: NSString = "en" {
    didSet {
      PLNNavigationSettings.sharedInstance().applicationLanguage = language as String
      if self.currentCarrier != nil {
        self.currentCarrier?.removeFromSuperview()
        initMap()
      }
    }
  }
  
  @objc var showOnMap: NSString?
  @objc var getRouteTo: NSString?
  
  private var isConfigured: Bool {
    return !applicationId.isEqual(to: "") && 
           !applicationSecret.isEqual(to: "") && 
           !uniqueId.isEqual(to: "")
  }
  
  //initWithFrame to init view from code
  override init(frame: CGRect) {
      super.init(frame: frame)
      setupNotifications()
  }
  
  //initWithCode to init view from xib or storyboard
  required init?(coder aDecoder: NSCoder) {
      super.init(coder: aDecoder)
      setupNotifications()
  }
  
  // Setup all notification observers
  private func setupNotifications() {
    NotificationCenter.default.addObserver(
      self, 
      selector: #selector(showPointOnMap), 
      name: Notification.Name("showPointOnMap"), 
      object: nil
    )
    
    NotificationCenter.default.addObserver(
      self, 
      selector: #selector(navigateTo), 
      name: Notification.Name("getRouteTo"), 
      object: nil
    )
    
    NotificationCenter.default.addObserver(
      self, 
      selector: #selector(handleConfigUpdate), 
      name: Notification.Name("updateConfig"), 
      object: nil
    )
  }
  
  // Handle configuration update from notification
  @objc func handleConfigUpdate(_ notification: Notification) {
    if let userInfo = notification.userInfo,
       let appId = userInfo["applicationId"] as? String,
       let secretKey = userInfo["secretKey"] as? String,
       let uniqueId = userInfo["uniqueId"] as? String {
      
      self.applicationId = appId as NSString
      self.applicationSecret = secretKey as NSString
      self.uniqueId = uniqueId as NSString
    }
  }
  
  // Update SDK configuration
  private func updateConfiguration() {
    if isConfigured {
      initMap()
    }
  }

  // Initialize the map
  func initMap() {
    // Remove existing map if any
    if let carrier = self.currentCarrier {
      carrier.removeFromSuperview()
      self.currentCarrier = nil
    }
    
    guard isConfigured else {
      print("Cannot initialize map: Missing configuration")
      return
    }
    
    PLNNavigationSettings.sharedInstance().applicationId = applicationId as String
    PLNNavigationSettings.sharedInstance().applicationSecret = applicationSecret as String
    PLNNavigationSettings.sharedInstance().navigationUniqueIdentifier = uniqueId as String
    PLNNavigationSettings.sharedInstance().applicationLanguage = language as String

    PLNavigationManager.sharedInstance()?.getReadyForStoreMap(completionHandler: { (error) in
      if error == nil {
          let carrierView = PLNNavigationMapView(frame: CGRect(x: 0, y: 0, width: self.bounds.size.width, height: self.bounds.size.height))
          carrierView.awakeFromNib()
          carrierView.delegate = self
          carrierView.searchBarBaseView.backgroundColor = UIColor.black
          carrierView.searchCancelButton.setTitleColor(.white, for: .normal)
          self.currentCarrier = carrierView
          self.addSubview(carrierView)
          
          // Check if we need to show a point or get a route on initialization
          self.checkInitialActions()
        } else {
          print("Error initializing map: \(String(describing: error))")
        }
    })
  }
  
  // Check if we need to perform initial actions
  private func checkInitialActions() {
    if let storeId = showOnMap {
      currentCarrier?.getShowonMapPin(storeId as String)
    } else if let storeId = getRouteTo {
      currentCarrier?.navigateWithStoreId(to: storeId as String)
    }
  }
  
  override func removeFromSuperview() {
    NotificationCenter.default.removeObserver(self)
    super.removeFromSuperview()
  }
  
  @objc func showPointOnMap(_ notification: Notification) {
    if let storeId = notification.userInfo?["storeId"] as? String {
      currentCarrier?.getShowonMapPin(storeId)
    }
  }
  
  @objc func navigateTo(_ notification: Notification) {
    if let storeId = notification.userInfo?["storeId"] as? String {
      currentCarrier?.navigateWithStoreId(to: storeId)
    }
  }
}

extension NavigationView: PLNNavigationMapViewDelegate {
  func childsAreReady() {
    checkInitialActions()
  }
}