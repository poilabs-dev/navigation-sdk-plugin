#import <Foundation/Foundation.h>
#import "PoilabsNavigationBridge.h"

@implementation PoilabsNavigationBridge

RCT_EXPORT_MODULE(PoilabsNavigationBridge);

RCT_EXPORT_METHOD(showPointOnMap:(NSString *)storeId) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NSDictionary* userInfo = @{@"storeId": storeId};
    [[NSNotificationCenter defaultCenter] postNotificationName:@"showPointOnMap" object:self userInfo:userInfo];
  });
}

RCT_EXPORT_METHOD(getRouteTo:(NSString *)storeId) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NSDictionary* userInfo = @{@"storeId": storeId};
    [[NSNotificationCenter defaultCenter] postNotificationName:@"getRouteTo" object:self userInfo:userInfo];
  });
}

RCT_EXPORT_METHOD(setApplicationConfig:(NSString *)applicationId 
                            secretKey:(NSString *)secretKey 
                             uniqueId:(NSString *)uniqueId) {
  dispatch_async(dispatch_get_main_queue(), ^{
    // Update the NavigationView configuration
    NSDictionary* userInfo = @{
      @"applicationId": applicationId,
      @"secretKey": secretKey,
      @"uniqueId": uniqueId
    };
    [[NSNotificationCenter defaultCenter] postNotificationName:@"updateConfig" object:self userInfo:userInfo];
  });
}

@end