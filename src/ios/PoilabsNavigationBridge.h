#ifndef PoilabsNavigationBridge_h
#define PoilabsNavigationBridge_h

#import <React/RCTBridgeModule.h>

@interface PoilabsNavigationBridge : NSObject <RCTBridgeModule>

-(void) showPointOnMap:(NSString *)storeId;
-(void) getRouteTo:(NSString *)storeId;
-(void) setApplicationConfig:(NSString *)applicationId 
               secretKey:(NSString *)secretKey 
               uniqueId:(NSString *)uniqueId;

@end
#endif /* PoilabsNavigationBridge_h */