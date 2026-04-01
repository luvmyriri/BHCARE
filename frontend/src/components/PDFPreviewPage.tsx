import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    Box,
    Button,
    Flex,
    HStack,
    VStack,
    Text,
    Heading,
    Icon,
    Divider,
    Badge,
    IconButton,
    Spinner,
    Center,
    Tooltip,
    SimpleGrid,
} from '@chakra-ui/react';
import {
    FiArrowLeft,
    FiDownload,
    FiRefreshCw,
    FiFileText,
    FiUser,
    FiEye,
    FiTrash2,
} from 'react-icons/fi';
import { formatSystemDate, formatTimestamp } from '../utils/dateFormatter';

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────
interface Prescription {
    item_name: string;
    quantity: number;
    instructions?: string;
}

interface MedRecord {
    created_at: string;
    doctor_name?: string;
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
    prescription?: string | Prescription[];
}

interface PatientInfo {
    first_name?: string;
    last_name?: string;
    p_id?: string;
    age?: string | number;
    gender?: string;
    contact_number?: string;
}

interface PDFPreviewPageProps {
    patient: PatientInfo;
    records: MedRecord[];
    onBack: () => void;
}

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────
function parsePrescriptions(raw: string | Prescription[] | undefined): Prescription[] {
    if (!raw) return [];
    try {
        return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {
        return [];
    }
}

// ─────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────
const PDFPreviewPage: React.FC<PDFPreviewPageProps> = ({ patient, records, onBack }) => {
    // Which records are still included (tracked by index)
    const [includedIndices, setIncludedIndices] = useState<number[]>(
        records.map((_, i) => i)
    );

    const includedRecords = useMemo(
        () => records.filter((_, i) => includedIndices.includes(i)),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [includedIndices] // only recomputes when indices actually change
    );

    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const pdfUrlRef = useRef<string | null>(null); // for revocation — avoids pdfUrl as effect dep
    const [isGenerating, setIsGenerating] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const logoBase64Ref = useRef<string | null>(null);

    // Pre-load logo once
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/images/Logo.png');
                const blob = await res.blob();
                const b64: string = await new Promise((resolve, reject) => {
                    const r = new FileReader();
                    r.onload = () => resolve(r.result as string);
                    r.onerror = reject;
                    r.readAsDataURL(blob);
                });
                logoBase64Ref.current = b64;
            } catch {
                logoBase64Ref.current = null;
            }
        })();
    }, []);

    // ── generatePdf receives the indices snapshot as a parameter ──
    // This avoids closing over state/derived-arrays that change every render.
    const generatePdf = useCallback(async (indices: number[]) => {
        setIsGenerating(true);

        // Revoke previous blob URL via ref (not state → no extra render deps)
        if (pdfUrlRef.current) {
            URL.revokeObjectURL(pdfUrlRef.current);
            pdfUrlRef.current = null;
        }

        const currentRecords = records.filter((_, i) => indices.includes(i));

        const doc = new jsPDF({ orientation: 'portrait' });
        let startY = 16;

        if (logoBase64Ref.current) {
            doc.addImage(logoBase64Ref.current, 'PNG', 14, 8, 16, 16);
            doc.setFontSize(15);
            doc.setTextColor(0);
            doc.text('Patient Medical History', 34, 16);
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text(
                `BHCare - Barangay 174 Health Center  ·  Generated: ${formatTimestamp(new Date().toISOString())}`,
                34, 22
            );
            startY = 30;
        } else {
            doc.setFontSize(15);
            doc.text('Patient Medical History', 14, 16);
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text(
                `BHCare - Barangay 174 Health Center  ·  Generated: ${formatTimestamp(new Date().toISOString())}`,
                14, 22
            );
            startY = 28;
        }

        autoTable(doc, {
            startY,
            head: [['Patient Information', '']],
            body: [
                ['Name', `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || '—'],
                ['Patient ID', patient.p_id || '—'],
                ['Age / Gender', `${patient.age || '—'} / ${patient.gender || '—'}`],
                ['Contact', patient.contact_number || '—'],
            ],
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: [43, 108, 176], textColor: 255, fontStyle: 'bold' },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 45 } },
            theme: 'grid',
        });

        let curY = (doc as any).lastAutoTable.finalY + 8;

        doc.setFontSize(11);
        doc.setTextColor(35, 78, 82);
        doc.setFont('helvetica', 'bold');
        doc.text(
            `Clinical Notes  (${currentRecords.length} record${currentRecords.length !== 1 ? 's' : ''})`,
            14, curY
        );
        doc.setFont('helvetica', 'normal');
        curY += 4;

        if (currentRecords.length === 0) {
            doc.setFontSize(9);
            doc.setTextColor(160);
            doc.text('No clinical notes selected.', 14, curY + 6);
        } else {
            currentRecords.forEach(record => {
                const meds = parsePrescriptions(record.prescription);
                const medsText = meds.length > 0
                    ? meds.map(m => `  • ${m.item_name} x${m.quantity}${m.instructions ? ` — ${m.instructions}` : ''}`).join('\n')
                    : '';

                const bodyRows: [string, string][] = [
                    ['S (Subjective)', record.subjective || '—'],
                    ['O (Objective)', record.objective || '—'],
                    ['A (Assessment)', record.assessment || '—'],
                    ['P (Plan)', record.plan || '—'],
                ];
                if (medsText) bodyRows.push(['Dispensed Medicine(s)', medsText]);

                autoTable(doc, {
                    startY: curY,
                    head: [[`${formatSystemDate(record.created_at)}`, record.doctor_name || 'Medical Officer']],
                    body: bodyRows,
                    styles: { fontSize: 8, cellPadding: 3 },
                    headStyles: { fillColor: [56, 178, 172], textColor: 255, fontStyle: 'bold' },
                    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } },
                    alternateRowStyles: { fillColor: [245, 255, 253] },
                    theme: 'grid',
                    margin: { left: 14, right: 14 },
                });
                curY = (doc as any).lastAutoTable.finalY + 6;
            });
        }

        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        pdfUrlRef.current = url;
        setPdfUrl(url);
        setIsGenerating(false);
    }, [patient, records]); // ← stable: patient & records are props that never change here

    // ── Trigger regen only when the SET of included indices actually changes ──
    // We use a string key so React can do a stable primitive comparison.
    const indicesKey = includedIndices.join(',');
    useEffect(() => {
        const snapshot = includedIndices.slice(); // capture current value
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => generatePdf(snapshot), 600);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [indicesKey, generatePdf]); // indicesKey is a string — only changes on delete

    // Delete a record from the PDF
    const deleteRecord = (originalIdx: number) => {
        setIncludedIndices(prev => prev.filter(i => i !== originalIdx));
    };

    // Download
    const handleDownload = () => {
        if (!pdfUrl) return;
        const filename = `MedicalHistory_${patient.last_name || 'Patient'}_${patient.first_name || ''}.pdf`
            .replace(/\s+/g, '_');
        const a = document.createElement('a');
        a.href = pdfUrl;
        a.download = filename;
        a.click();
    };

    // ────────────────────────────────────────────────────
    // Render
    // ────────────────────────────────────────────────────
    return (
        <Box minH="100vh" bg="gray.50" display="flex" flexDirection="column">

            {/* ── Top Bar ── */}
            <Flex
                as="header"
                align="center"
                justify="space-between"
                px={6}
                py={3}
                bg="white"
                borderBottom="1px solid"
                borderColor="gray.200"
                boxShadow="sm"
                position="sticky"
                top={0}
                zIndex={10}
            >
                <HStack spacing={4}>
                    <IconButton
                        aria-label="Back"
                        icon={<FiArrowLeft />}
                        variant="ghost"
                        colorScheme="teal"
                        borderRadius="xl"
                        onClick={onBack}
                    />
                    <HStack spacing={3}>
                        <Box p={2} bg="teal.50" borderRadius="lg">
                            <Icon as={FiFileText} color="teal.500" boxSize={5} />
                        </Box>
                        <VStack align="start" spacing={0}>
                            <Text fontWeight="800" fontSize="md" color="teal.800" lineHeight="1.2">
                                PDF Preview
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                                {patient.first_name} {patient.last_name} · {includedRecords.length} of {records.length} record{records.length !== 1 ? 's' : ''} included
                            </Text>
                        </VStack>
                    </HStack>
                </HStack>

                <HStack spacing={3}>
                    <Tooltip label="Refresh Preview" placement="bottom">
                        <IconButton
                            aria-label="Refresh"
                            icon={<FiRefreshCw />}
                            variant="outline"
                            colorScheme="gray"
                            borderRadius="xl"
                            isLoading={isGenerating}
                            onClick={() => generatePdf(includedIndices)}
                        />
                    </Tooltip>
                    <Button
                        leftIcon={<FiDownload />}
                        colorScheme="teal"
                        borderRadius="xl"
                        boxShadow="md"
                        isDisabled={!pdfUrl || isGenerating || includedRecords.length === 0}
                        onClick={handleDownload}
                        _hover={{ transform: 'translateY(-1px)', boxShadow: 'lg' }}
                        transition="all 0.2s"
                    >
                        Download PDF
                    </Button>
                </HStack>
            </Flex>

            {/* ── Split Layout ── */}
            <Flex flex={1} overflow="hidden" h="calc(100vh - 60px)">

                {/* ── LEFT: Record Selector (read-only + delete) ── */}
                <Box
                    w="420px"
                    minW="380px"
                    overflowY="auto"
                    bg="white"
                    borderRight="1px solid"
                    borderColor="gray.200"
                >
                    <Box p={6}>

                        {/* Patient Info — read-only */}
                        <Box mb={6} p={5} bg="blue.50" borderRadius="2xl" border="1px solid" borderColor="blue.100">
                            <HStack mb={4} spacing={3}>
                                <Box p={2} bg="blue.100" borderRadius="lg">
                                    <Icon as={FiUser} color="blue.600" boxSize={4} />
                                </Box>
                                <Text fontWeight="800" color="blue.800" fontSize="sm" textTransform="uppercase" letterSpacing="wide">
                                    Patient Information
                                </Text>
                            </HStack>
                            <SimpleGrid columns={2} spacing={3}>
                                <Box>
                                    <Text fontSize="xs" color="gray.500" fontWeight="700" mb={0.5}>Name</Text>
                                    <Text fontSize="sm" fontWeight="600" color="gray.800">
                                        {patient.first_name} {patient.last_name}
                                    </Text>
                                </Box>
                                <Box>
                                    <Text fontSize="xs" color="gray.500" fontWeight="700" mb={0.5}>Patient ID</Text>
                                    <Text fontSize="sm" fontWeight="600" color="gray.800">{patient.p_id || '—'}</Text>
                                </Box>
                                <Box>
                                    <Text fontSize="xs" color="gray.500" fontWeight="700" mb={0.5}>Age / Gender</Text>
                                    <Text fontSize="sm" fontWeight="600" color="gray.800">
                                        {patient.age || '—'} / {patient.gender || '—'}
                                    </Text>
                                </Box>
                                <Box>
                                    <Text fontSize="xs" color="gray.500" fontWeight="700" mb={0.5}>Contact</Text>
                                    <Text fontSize="sm" fontWeight="600" color="gray.800">{patient.contact_number || '—'}</Text>
                                </Box>
                            </SimpleGrid>
                        </Box>

                        <Divider mb={5} />

                        {/* Records heading */}
                        <Flex align="center" justify="space-between" mb={4}>
                            <Text fontWeight="800" color="teal.800" fontSize="sm" textTransform="uppercase" letterSpacing="wide">
                                Clinical Notes
                            </Text>
                            <Badge colorScheme={includedRecords.length > 0 ? 'teal' : 'red'} borderRadius="full" px={3} py={1}>
                                {includedRecords.length} / {records.length} included
                            </Badge>
                        </Flex>

                        {includedRecords.length === 0 && (
                            <Box py={6} textAlign="center" border="2px dashed" borderColor="red.200" borderRadius="xl" bg="red.50">
                                <Text color="red.400" fontSize="sm" fontWeight="600">All records removed.</Text>
                                <Text color="red.300" fontSize="xs" mt={1}>The PDF will have no clinical notes.</Text>
                            </Box>
                        )}

                        <VStack spacing={4} align="stretch">
                            {records.map((rec, originalIdx) => {
                                const isIncluded = includedIndices.includes(originalIdx);
                                const meds = parsePrescriptions(rec.prescription);

                                return (
                                    <Box
                                        key={originalIdx}
                                        p={4}
                                        bg={isIncluded ? 'white' : 'gray.50'}
                                        borderRadius="xl"
                                        border="1.5px solid"
                                        borderColor={isIncluded ? 'teal.200' : 'gray.200'}
                                        boxShadow={isIncluded ? 'sm' : 'none'}
                                        opacity={isIncluded ? 1 : 0.5}
                                        transition="all 0.2s"
                                        position="relative"
                                    >
                                        {/* Record header */}
                                        <Flex justify="space-between" align="center" mb={3}>
                                            <HStack spacing={2}>
                                                <Badge
                                                    colorScheme={isIncluded ? 'teal' : 'gray'}
                                                    borderRadius="full"
                                                    px={3} py={1}
                                                    fontSize="xs"
                                                    fontWeight="700"
                                                >
                                                    {formatSystemDate(rec.created_at)}
                                                </Badge>
                                                <Badge colorScheme="purple" variant="subtle" borderRadius="full" px={2} py={1} fontSize="xs">
                                                    {rec.doctor_name || 'Medical Officer'}
                                                </Badge>
                                            </HStack>

                                            <Tooltip label={isIncluded ? 'Remove from PDF' : 'Already removed'} placement="left">
                                                <IconButton
                                                    aria-label="Remove record from PDF"
                                                    icon={<FiTrash2 />}
                                                    size="sm"
                                                    colorScheme="red"
                                                    variant={isIncluded ? 'ghost' : 'solid'}
                                                    borderRadius="lg"
                                                    isDisabled={!isIncluded}
                                                    onClick={() => deleteRecord(originalIdx)}
                                                />
                                            </Tooltip>
                                        </Flex>

                                        {/* SOAP read-only display */}
                                        <VStack align="stretch" spacing={2} pl={1}>
                                            {[
                                                { label: 'S — Subjective', value: rec.subjective, color: 'blue' },
                                                { label: 'O — Objective', value: rec.objective, color: 'green' },
                                                { label: 'A — Assessment', value: rec.assessment, color: 'purple' },
                                                { label: 'P — Plan', value: rec.plan, color: 'orange' },
                                            ].map(({ label, value, color }) => (
                                                <Box key={label}>
                                                    <Text
                                                        fontSize="xs"
                                                        fontWeight="800"
                                                        color={`${color}.600`}
                                                        mb={0.5}
                                                        textTransform="uppercase"
                                                        letterSpacing="wide"
                                                    >
                                                        {label}
                                                    </Text>
                                                    <Text fontSize="sm" color="gray.700" lineHeight="tall">
                                                        {value || <Text as="span" color="gray.400" fontStyle="italic">—</Text>}
                                                    </Text>
                                                </Box>
                                            ))}

                                            {/* Medicines */}
                                            {meds.length > 0 && (
                                                <Box mt={1} p={3} bg="teal.50" borderRadius="lg" border="1px solid" borderColor="teal.100">
                                                    <Text fontSize="xs" fontWeight="800" color="teal.700" mb={1} textTransform="uppercase">
                                                        Dispensed Medicine(s)
                                                    </Text>
                                                    <VStack align="start" spacing={1}>
                                                        {meds.map((med, mi) => (
                                                            <HStack key={mi} spacing={2} fontSize="sm">
                                                                <Text color="teal.600" fontWeight="700">•</Text>
                                                                <Text fontWeight="700" color="teal.700">{med.item_name}</Text>
                                                                <Text color="gray.500">×{med.quantity}</Text>
                                                                {med.instructions && (
                                                                    <Text color="gray.500" fontStyle="italic">— {med.instructions}</Text>
                                                                )}
                                                            </HStack>
                                                        ))}
                                                    </VStack>
                                                </Box>
                                            )}
                                        </VStack>

                                        {/* Removed overlay label */}
                                        {!isIncluded && (
                                            <Flex
                                                position="absolute"
                                                inset={0}
                                                borderRadius="xl"
                                                align="center"
                                                justify="center"
                                                bg="blackAlpha.100"
                                                pointerEvents="none"
                                            >
                                                <Badge colorScheme="red" fontSize="xs" px={3} py={1} borderRadius="full" boxShadow="sm">
                                                    Removed from PDF
                                                </Badge>
                                            </Flex>
                                        )}
                                    </Box>
                                );
                            })}
                        </VStack>
                    </Box>
                </Box>

                {/* ── RIGHT: Live PDF Preview ── */}
                <Box flex={1} bg="gray.200" overflow="hidden" display="flex" flexDirection="column">
                    <Flex align="center" px={4} py={2} bg="gray.700" gap={3}>
                        <HStack spacing={2}>
                            <Icon as={FiEye} color="white" boxSize={4} />
                            <Text color="white" fontSize="sm" fontWeight="700">Live Preview</Text>
                        </HStack>
                        {isGenerating && (
                            <HStack spacing={2}>
                                <Spinner size="xs" color="teal.300" />
                                <Text color="teal.200" fontSize="xs">Updating…</Text>
                            </HStack>
                        )}
                        <Text color="gray.400" fontSize="xs" ml="auto">
                            Delete a record on the left to update the preview
                        </Text>
                    </Flex>

                    <Box flex={1} overflow="hidden" p={4}>
                        {pdfUrl && !isGenerating ? (
                            <Box
                                as="iframe"
                                src={pdfUrl}
                                title="PDF Preview"
                                w="full"
                                h="full"
                                borderRadius="xl"
                                overflow="hidden"
                                boxShadow="2xl"
                                style={{ border: 'none', display: 'block' }}
                            />
                        ) : (
                            <Center h="full" flexDirection="column" gap={4}>
                                <Spinner size="xl" color="teal.400" thickness="4px" />
                                <Text color="gray.500" fontSize="sm">Generating PDF preview…</Text>
                            </Center>
                        )}
                    </Box>
                </Box>

            </Flex>
        </Box>
    );
};

export default PDFPreviewPage;
