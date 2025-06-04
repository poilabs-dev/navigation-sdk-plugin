import UIKit
import PoilabsNavigation

@objc(NavigationView)
class NavigationView: UIView {
  
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
  
  @objc var showOnMap: NSString? {
    didSet {
      if isConfigured && currentCarrier != nil {
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
          if let storeId = self.showOnMap {
            self.currentCarrier?.getShowonMapPin(storeId as String)
          }
        }
      }
    }
  }
  
  @objc var getRouteTo: NSString? {
    didSet {
      if isConfigured && currentCarrier != nil {
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
          if let storeId = self.getRouteTo {
            self.currentCarrier?.navigateWithStoreId(to: storeId as String)
          }
        }
      }
    }
  }
  
  private var isConfigured: Bool {
    return !applicationId.isEqual(to: "") && 
           !applicationSecret.isEqual(to: "") && 
           !uniqueId.isEqual(to: "")
  }
  
  private var isInitialized = false
  
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
      selector: #selector(reInitMap), 
      name: Notification.Name("reInitMap"), 
      object: nil
    )
  }
  
  // Update SDK configuration
  private func updateConfiguration() {
    if isConfigured && !isInitialized {
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
      DispatchQueue.main.async {
        if error == nil {
          let carrierView = PLNNavigationMapView(frame: CGRect(x: 0, y: 0, width: self.bounds.size.width, height: self.bounds.size.height))
          carrierView.awakeFromNib()
          carrierView.delegate = self
          carrierView.searchBarBaseView.backgroundColor = UIColor.black
          carrierView.searchCancelButton.setTitleColor(.white, for: .normal)
          self.currentCarrier = carrierView
          self.addSubview(carrierView)
          self.isInitialized = true
          
          // Auto layout setup
          carrierView.translatesAutoresizingMaskIntoConstraints = false
          NSLayoutConstraint.activate([
            carrierView.topAnchor.constraint(equalTo: self.topAnchor),
            carrierView.leadingAnchor.constraint(equalTo: self.leadingAnchor),
            carrierView.trailingAnchor.constraint(equalTo: self.trailingAnchor),
            carrierView.bottomAnchor.constraint(equalTo: self.bottomAnchor)
          ])
          
          // Check if we need to show a point or get a route on initialization
          self.checkInitialActions()
        } else {
          print("Error initializing map: \(String(describing: error))")
        }
      }
    })
  }
  
  // Check if we need to perform initial actions
  private func checkInitialActions() {
    DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
      if let storeId = self.showOnMap, !storeId.isEqual(to: "") {
        self.currentCarrier?.getShowonMapPin(storeId as String)
      } else if let storeId = self.getRouteTo, !storeId.isEqual(to: "") {
        self.currentCarrier?.navigateWithStoreId(to: storeId as String)
      }
    }
  }
  
  override func layoutSubviews() {
    super.layoutSubviews()
    
    // Update carrier view frame when parent view layout changes
    if let carrier = currentCarrier {
      carrier.frame = self.bounds
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
  
  @objc func reInitMap() {
    NotificationCenter.default.removeObserver(self)
    if self.currentCarrier != nil {
      self.currentCarrier?.removeFromSuperview()
      self.currentCarrier = nil
      self.isInitialized = false
      initMap()
    }
  }
}

extension NavigationView: PLNNavigationMapViewDelegate {
  func childsAreReady() {
    checkInitialActions()
  }
  
  func didLocationStatusChange(_ status: PLLocationStatus) {
    // Handle location status changes if needed
  }
  
  func poilabsNavigationReadyForRouting() {
    // Ready for routing operations
  }
  
  func poilabsNavigation(didUpdate userLocation: CLLocationCoordinate2D, floorLevel: Int, floorName: String) {
    // Handle location updates if needed
  }
  
  func didUserVisitPoint(with storeIds: [String]) {
    // Handle user visit points if needed
  }
}