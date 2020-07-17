/*
 * Rtpfb.h
 *
 *  Created on: 2020/07/16
 *      Author: max
 *		Email: Kingsleyyau@gmail.com
 */

#ifndef RTP_PACKET_RTPFB_H_
#define RTP_PACKET_RTPFB_H_

#include "RtcpPacketImp.h"

namespace mediaserver {

class Rtpfb: public RtcpPacketImp {
public:
	static constexpr uint8_t kPacketType = 205;

	Rtpfb() = default;
	virtual ~Rtpfb() override = default;

	uint32_t media_ssrc_ = 0;

protected:
	static constexpr size_t kCommonFeedbackLength = 8;
	void ParseCommonFeedback(const uint8_t* payload);
	void CreateCommonFeedback(uint8_t* payload) const;
};

} /* namespace mediaserver */

#endif /* RTP_PACKET_RTPFB_H_ */