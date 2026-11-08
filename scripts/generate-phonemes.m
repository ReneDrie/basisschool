// Authoring only: compile and run via generate-phonemes.mjs on macOS.
#import <Foundation/Foundation.h>
#import <AVFoundation/AVFoundation.h>
#import <string.h>
#import <math.h>
static AVAudioPCMBuffer *silence(AVAudioFormat *format,double seconds){
  AVAudioFrameCount frames=(AVAudioFrameCount)(format.sampleRate*seconds);
  AVAudioPCMBuffer *buffer=[[AVAudioPCMBuffer alloc]initWithPCMFormat:format frameCapacity:frames];buffer.frameLength=frames;
  AudioBufferList *list=buffer.mutableAudioBufferList;
  for(UInt32 i=0;i<list->mNumberBuffers;i++)memset(list->mBuffers[i].mData,0,list->mBuffers[i].mDataByteSize);
  return buffer;
}
int main(int argc,const char *argv[]){@autoreleasepool{
  if(argc!=3){fprintf(stderr,"Expected manifest and output directory\n");return 1;}
  NSError *error=nil;
  NSArray *entries=[NSJSONSerialization JSONObjectWithData:[NSData dataWithContentsOfFile:@(argv[1])] options:0 error:&error];
  if(!entries||error){NSLog(@"Invalid manifest: %@",error);return 1;}
  AVSpeechSynthesizer *synth=[AVSpeechSynthesizer new];
  for(NSDictionary *entry in entries){
    AVSpeechSynthesisVoice *voice=nil;
    for(AVSpeechSynthesisVoice *candidate in AVSpeechSynthesisVoice.speechVoices)if([candidate.name isEqualToString:entry[@"voiceName"]]&&[candidate.language hasPrefix:@"nl"]){voice=candidate;break;}
    if(!voice){NSLog(@"Dutch voice %@ is required",entry[@"voiceName"]);return 1;}
    NSMutableAttributedString *attr=[[NSMutableAttributedString alloc]initWithString:entry[@"sound"]];
    [attr addAttribute:AVSpeechSynthesisIPANotationAttribute value:entry[@"engineIPA"]?:entry[@"ipa"] range:NSMakeRange(0,attr.length)];
    AVSpeechUtterance *utterance=[[AVSpeechUtterance alloc]initWithAttributedString:attr];utterance.voice=voice;utterance.rate=0.2;
    __block AVAudioFile *file=nil;__block BOOL done=NO;__block BOOL failed=NO;__block long long frames=0;__block double peak=0;
    [synth writeUtterance:utterance toBufferCallback:^(AVAudioBuffer *buffer){
      AVAudioPCMBuffer *pcm=(AVAudioPCMBuffer *)buffer;NSError *writeError=nil;
      if(!pcm.frameLength){if(file)[file writeFromBuffer:silence(file.processingFormat,0.32) error:&writeError];file=nil;done=YES;if(writeError)failed=YES;return;}
      if(pcm.floatChannelData)for(AVAudioFrameCount i=0;i<pcm.frameLength;i++)peak=fmax(peak,fabs(pcm.floatChannelData[0][i]));
      if(!file){
        NSURL *url=[NSURL fileURLWithPath:[NSString stringWithFormat:@"%s/%@.caf",argv[2],entry[@"sound"]]];
        file=[[AVAudioFile alloc]initForWriting:url settings:pcm.format.settings error:&writeError];
        if(file)[file writeFromBuffer:silence(pcm.format,0.18) error:&writeError];
      }
      if(file)[file writeFromBuffer:pcm error:&writeError];
      frames+=pcm.frameLength;if(writeError){NSLog(@"%@",writeError);failed=YES;done=YES;}
    }];
    NSDate *deadline=[NSDate dateWithTimeIntervalSinceNow:25];
    while(!done&&[deadline timeIntervalSinceNow]>0)[[NSRunLoop currentRunLoop]runUntilDate:[NSDate dateWithTimeIntervalSinceNow:0.02]];
    if(!done||failed||frames<50||peak<0.0001){NSLog(@"Failed to synthesize %@",entry[@"sound"]);return 1;}
    // Match peak levels so short stop consonants remain audible beside vowels.
    NSURL *source=[NSURL fileURLWithPath:[NSString stringWithFormat:@"%s/%@.caf",argv[2],entry[@"sound"]]];
    NSURL *normalized=[source URLByAppendingPathExtension:@"normalized.caf"];
    NSError *normalizationError=nil;
    AVAudioFile *reader=[[AVAudioFile alloc]initForReading:source error:&normalizationError];
    if(!reader){NSLog(@"Cannot open audio: %@",normalizationError);return 1;}
    AVAudioPCMBuffer *samples=[[AVAudioPCMBuffer alloc]initWithPCMFormat:reader.processingFormat frameCapacity:(AVAudioFrameCount)reader.length];
    if(![reader readIntoBuffer:samples error:&normalizationError]||!samples.floatChannelData){NSLog(@"Cannot normalize %@",entry[@"sound"]);return 1;}
    float gain=(float)(0.65/peak);
    for(AVAudioChannelCount channel=0;channel<samples.format.channelCount;channel++)for(AVAudioFrameCount i=0;i<samples.frameLength;i++)samples.floatChannelData[channel][i]*=gain;
    AVAudioFile *writer=[[AVAudioFile alloc]initForWriting:normalized settings:samples.format.settings error:&normalizationError];
    if(!writer||![writer writeFromBuffer:samples error:&normalizationError]){NSLog(@"Cannot write normalized audio: %@",normalizationError);return 1;}
    writer=nil;reader=nil;
    if(![NSFileManager.defaultManager removeItemAtURL:source error:&normalizationError]||![NSFileManager.defaultManager moveItemAtURL:normalized toURL:source error:&normalizationError]){NSLog(@"Cannot finish audio: %@",normalizationError);return 1;}
  }
}return 0;}
