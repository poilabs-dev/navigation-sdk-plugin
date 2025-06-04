#ifndef PoilabsNavigationBridge_h
#define PoilabsNavigationBridge_h

#import <React/RCTBridgeModule.h>

@interface PoilabsNavigationBridge : NSObject <RCTBridgeModule>

// Show a point on map (single store)
-(void) showPointOnMap:(NSString *)storeId;

// Get route to a store
-(void) getRouteTo:(NSString *)storeId;

// Reinitialize map
-(void) reInitMap;

// Initialize SDK with Promise
-(void) initNavigationSDK:(NSString *)applicationId
        applicationSecret:(NSString *)applicationSecret
        uniqueId:(NSString *)uniqueId
        resolver:(RCTPromiseResolveBlock)resolve
        rejecter:(RCTPromiseRejectBlock)reject;

// Prepare for store map with Promise
-(void) getReadyForStoreMap:(RCTPromiseResolveBlock)resolve
        rejecter:(RCTPromiseRejectBlock)reject;

// Start positioning with Promise
-(void) startPositioning:(RCTPromiseResolveBlock)resolve
        rejecter:(RCTPromiseRejectBlock)reject;

// Stop positioning with Promise
-(void) stopPositioning:(RCTPromiseResolveBlock)resolve
        rejecter:(RCTPromiseRejectBlock)reject;

// Show points on map (array version for compatibility)
-(void) showPointOnMap:(NSArray *)storeIds
        resolver:(RCTPromiseResolveBlock)resolve
        rejecter:(RCTPromiseRejectBlock)reject;

@end

#endif /* PoilabsNavigationBridge_h */