import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { getDayName, getStartEndTimeWithDesiredDate } from 'src/app/obx/pages/schedules/helper';
import { getHitsForRunSheet } from 'src/services/runsheet.services';
import { daysOfWeekWithVal, toastSettings } from 'src/utils/constants';

const useGetHits = (state, isEdit = false) => {
  const [hitsList, setHitsList] = useState([]);
  const [hitsLoading, setHitsLoading] = useState(false);

  const getHits = useCallback(
    async (apendRunsheetName = false, errorCallback = () => {}) => {
      setHitsLoading(true);

      try {
        let payload = {};
        if (!isEdit) {
          const finalStartDate = getStartEndTimeWithDesiredDate(
            state?.startDate,
            state?.startsAt,
            state?.endsAt,
            true,
          );

          payload = {
            windowStart: finalStartDate?.startTime.toISOString(),
            windowEnd: finalStartDate?.endTime.toISOString(),
            dutyDay: daysOfWeekWithVal.find(
              (data) => data?.label === getDayName(finalStartDate?.startTime.toISOString()),
            )?.value,
          };
        } else {
          payload = {
            windowStart: state?.startsAt.toISOString(),
            windowEnd: state?.endsAt.toISOString(),
            dutyDay: state?.shiftDays[0],
          };
        }

        if (apendRunsheetName) payload.runsheetName = state?.runsheetName;

        const response = await getHitsForRunSheet(payload);
        setHitsList(response);
      } catch (e) {
        toast.error(e?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        errorCallback();
      } finally {
        setHitsLoading(false);
      }
    },
    [state],
  );

  return { hitsList, hitsLoading, getHits, setHitsList };
};

export default useGetHits;
