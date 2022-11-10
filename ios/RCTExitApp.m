//
//  RCTExitApp.m
//  RohTVApp
//
//  Created by User on 08.11.2022.
//

#import <Foundation/Foundation.h>
#import "RCTExitApp.h"

@implementation RCTExitApp

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(exit)
{
  RCTLogInfo(@"Exit of App iOS");
  exit(0);
}

@end
