import React, { useState, useRef, useEffect } from 'react';
import {
    Box, Text, HStack, IconButton, Grid,
    useOutsideClick, Flex
} from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight, FiCalendar, FiX } from 'react-icons/fi';

interface AppointmentCalendarProps {
    value: string; // 'YYYY-MM-DD' or ''
    onChange: (date: string) => void;
    allowedDays?: number[]; // 0=Sun … 6=Sat, undefined = all days
    scheduleHint?: string;
    minDate?: string; // 'YYYY-MM-DD'
    isInvalid?: boolean;
}

const MONTHS = ['January','February','March','April','May','June',
                 'July','August','September','October','November','December'];
const DAY_LABELS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function parseLocalDate(str: string): Date {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
}

function toYMD(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
    value, onChange, allowedDays, scheduleHint, minDate, isInvalid
}) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const todayYMD = toYMD(today);
    const minYMD = minDate ?? todayYMD;

    const initialDate = value ? parseLocalDate(value) : today;
    const [viewYear, setViewYear] = useState(initialDate.getFullYear());
    const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useOutsideClick({ ref, handler: () => setOpen(false) });

    // Update view when value changes externally
    useEffect(() => {
        if (value) {
            const d = parseLocalDate(value);
            setViewYear(d.getFullYear());
            setViewMonth(d.getMonth());
        }
    }, [value]);

    const prevMonth = () => {
        if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
        else setViewMonth(m => m - 1);
    };

    const nextMonth = () => {
        if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
        else setViewMonth(m => m + 1);
    };

    // Build calendar grid
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (number | null)[] = [
        ...Array(firstDay).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
    ];
    // Pad to full weeks
    while (cells.length % 7 !== 0) cells.push(null);

    const handleDayClick = (day: number) => {
        const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        if (dateStr < minYMD) return;
        const dayOfWeek = new Date(viewYear, viewMonth, day).getDay();
        if (allowedDays && !allowedDays.includes(dayOfWeek)) return;
        onChange(dateStr);
        setOpen(false);
    };

    const displayValue = value
        ? parseLocalDate(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : '';

    return (
        <Box position="relative" ref={ref}>
            {/* Trigger input */}
            <Flex
                h="40px"
                px={3}
                align="center"
                justify="space-between"
                border="1px solid"
                borderColor={isInvalid ? 'red.400' : open ? 'teal.400' : 'gray.200'}
                borderRadius="md"
                cursor="pointer"
                bg="white"
                onClick={() => setOpen(o => !o)}
                transition="all 0.15s"
                _hover={{ borderColor: 'teal.300' }}
                boxShadow={open ? '0 0 0 1px var(--chakra-colors-teal-400)' : undefined}
            >
                <HStack spacing={2}>
                    <Box color={value ? 'teal.600' : 'gray.400'}>
                        <FiCalendar size={15} />
                    </Box>
                    <Text fontSize="sm" color={value ? 'gray.800' : 'gray.400'} fontWeight={value ? '500' : '400'}>
                        {displayValue || 'Select a date'}
                    </Text>
                </HStack>
                {value && (
                    <Box
                        as="span"
                        color="gray.400"
                        cursor="pointer"
                        onClick={e => { e.stopPropagation(); onChange(''); }}
                        _hover={{ color: 'red.400' }}
                    >
                        <FiX size={13} />
                    </Box>
                )}
            </Flex>

            {/* Dropdown calendar */}
            {open && (
                <Box
                    position="absolute"
                    top="calc(100% + 6px)"
                    left={0}
                    zIndex={100}
                    bg="white"
                    borderRadius="xl"
                    boxShadow="0 8px 40px rgba(0,0,0,0.14)"
                    border="1px solid"
                    borderColor="gray.100"
                    p={4}
                    minW="300px"
                    overflow="hidden"
                >
                    {/* Calendar header */}
                    <HStack justify="space-between" mb={4}>
                        <IconButton
                            aria-label="Prev month"
                            icon={<FiChevronLeft />}
                            size="sm"
                            variant="ghost"
                            colorScheme="teal"
                            borderRadius="full"
                            onClick={prevMonth}
                        />
                        <Text fontWeight="700" fontSize="sm" color="gray.800">
                            {MONTHS[viewMonth]} {viewYear}
                        </Text>
                        <IconButton
                            aria-label="Next month"
                            icon={<FiChevronRight />}
                            size="sm"
                            variant="ghost"
                            colorScheme="teal"
                            borderRadius="full"
                            onClick={nextMonth}
                        />
                    </HStack>

                    {/* Day labels */}
                    <Grid templateColumns="repeat(7, 1fr)" mb={1}>
                        {DAY_LABELS.map(label => (
                            <Box key={label} textAlign="center" py={1}>
                                <Text fontSize="xs" fontWeight="700" color="gray.400" letterSpacing="wide">
                                    {label}
                                </Text>
                            </Box>
                        ))}
                    </Grid>

                    {/* Date cells */}
                    <Grid templateColumns="repeat(7, 1fr)" gap={1}>
                        {cells.map((day, i) => {
                            if (!day) return <Box key={i} />;

                            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                            const dayOfWeek = new Date(viewYear, viewMonth, day).getDay();
                            const isPast = dateStr < minYMD;
                            const isUnavailable = allowedDays ? !allowedDays.includes(dayOfWeek) : false;
                            const isDisabled = isPast || isUnavailable;
                            const isSelected = dateStr === value;
                            const isToday = dateStr === todayYMD;

                            return (
                                <Box
                                    key={i}
                                    textAlign="center"
                                    py={1}
                                    borderRadius="full"
                                    cursor={isDisabled ? 'not-allowed' : 'pointer'}
                                    bg={isSelected ? 'teal.500' : 'transparent'}
                                    border={isToday && !isSelected ? '2px solid' : '2px solid transparent'}
                                    borderColor={isToday && !isSelected ? 'teal.300' : 'transparent'}
                                    opacity={isDisabled ? 0.3 : 1}
                                    _hover={!isDisabled ? {
                                        bg: isSelected ? 'teal.600' : 'teal.50',
                                        color: isSelected ? 'white' : 'teal.700'
                                    } : {}}
                                    transition="all 0.1s"
                                    onClick={() => !isDisabled && handleDayClick(day)}
                                    title={isUnavailable && !isPast ? `Not available on this day` : undefined}
                                >
                                    <Text
                                        fontSize="sm"
                                        fontWeight={isToday || isSelected ? '700' : '400'}
                                        color={isSelected ? 'white' : isUnavailable ? 'gray.300' : isToday ? 'teal.600' : 'gray.700'}
                                    >
                                        {day}
                                    </Text>
                                </Box>
                            );
                        })}
                    </Grid>

                    {/* Legend */}
                    {scheduleHint && (
                        <Box mt={4} pt={3} borderTop="1px solid" borderColor="gray.100">
                            <HStack spacing={2}>
                                <Box w={3} h={3} borderRadius="full" bg="teal.500" />
                                <Text fontSize="xs" color="gray.500" fontWeight="600">
                                    Available: {scheduleHint}
                                </Text>
                            </HStack>
                            {allowedDays && (
                                <Text fontSize="xs" color="gray.400" mt={1}>
                                    Greyed-out dates are not available for this service.
                                </Text>
                            )}
                        </Box>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default AppointmentCalendar;
