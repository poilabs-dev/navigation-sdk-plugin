#ifndef PoilabsNavigationBridge_h
#define PoilabsNavigationBridge_h

#import <React/RCTBridgeModule.h>

@interface PoilabsNavigationBridge : NSObject <RCTBridgeModule>

// Show a point on map
-(void) showPointOnMap:(NSString *)storeId;

// Get route to a store
-(void) getRouteTo:(NSString *)storeId;

// Set application configuration
-(void) setApplicationConfig:(NSString *)applicationId 
               secretKey:(NSString *)secretKey 
               uniqueId:(NSString *)uniqueId;

// Initialize SDK
-(void) initNavigationSDK:(NSString *)applicationId
              applicationSecret:(NSString *)applicationSecret
              uniqueId:(NSString *)uniqueId
              resolver:(RCTPromiseResolveBlock)resolve
              rejecter:(RCTPromiseRejectBlock)reject;

// Prepare for store map
-(void) getReadyForStoreMap:(RCTPromiseResolveBlock)resolve
              rejecter:(RCTPromiseRejectBlock)reject;

// Start positioning
-(void) startPositioning:(RCTPromiseResolveBlock)resolve
              rejecter:(RCTPromiseRejectBlock)reject;

// Stop positioning
-(void) stopPositioning:(RCTPromiseResolveBlock)resolve
              rejecter:(RCTPromiseRejectBlock)reject;

@end
#endif /* PoilabsNavigationBridge_h */