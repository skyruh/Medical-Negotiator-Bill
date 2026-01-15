import React, { useState, useEffect } from 'react';
import { CITIES } from '../constants'; // Assumes constants is in parent src folder, adjusting path below if needed

// Helper to determine Tier for display only (duplicate logic from backend effectively, or just simple check)
// Since we don't have the TIER lists exposed to frontend easily without duplicating, let's just do a rough check or rely on metadata if we improved backend.
// Backend sends tier_multiplier but not "Tier 1".
// Let's implement a simple display helper.
const getTierFromCity = (city) => {
    // Quick heuristic based on the arrays we know.
    // Ideally this comes from a shared config or backend.
    const TIER_1 = ["Delhi", "Mumbai", "Kolkata", "Chennai", "Bengaluru", "Hyderabad", "Pune", "Ahmedabad"];
    if (TIER_1.includes(city)) return "1";
    if (city === "Other/Remote (Tier 3)") return "3";
    return "2";
};

const AnalysisResult = ({ data, onReset }) => {
    // Determine initial state
    const [resultData, setResultData] = useState(data);
    const [isEditing, setIsEditing] = useState(false);
    const [editedItems, setEditedItems] = useState([]);
    const [totalDiff, setTotalDiff] = useState(0); // Difference between sum of items and extracted total
    const [isRecalculating, setIsRecalculating] = useState(false);

    useEffect(() => {
        setResultData(data);
    }, [data]);

    // ... rest of code
    useEffect(() => {
        if (resultData && resultData.comparison) {
            setEditedItems(resultData.comparison.items.map(item => ({
                ...item,
                bill_price: item.bill_price || 0
            })));
        }
    }, [resultData]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount || 0);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...editedItems];
        newItems[index] = {
            ...newItems[index],
            [field]: value
        };
        setEditedItems(newItems);
    };

    const deleteItem = (index) => {
        const newItems = editedItems.filter((_, i) => i !== index);
        setEditedItems(newItems);
    };

    const addItem = () => {
        setEditedItems([...editedItems, {
            description: "New Item",
            bill_price: 0,
            cghs_rate: null,
            status: "New",
            variance: 0,
            code: null,
            normalized_name: null
        }]);
    };

    const handleRecalculate = async () => {
        setIsRecalculating(true);
        try {
            // Calculate new total based on items
            // Note: In a real scenario, we might want to let the user edit the total too,
            // but usually the total is the sum of items. 
            // However, the original issue was that the total extracted != sum of items.
            // Let's assume for re-calculation that total = sum of items.
            const newTotal = editedItems.reduce((sum, item) => sum + Number(item.bill_price), 0);

            const payload = {
                ...resultData,
                city: resultData.metadata?.city || "Delhi", // Ensure city is passed for re-analysis
                total_amount: newTotal,
                line_items: editedItems.map(item => ({
                    ...item,
                    total_price: Number(item.bill_price) // Backend expects total_price
                }))
            };

            const response = await fetch('/api/reanalyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Recalculation failed');
            }

            const newAnalysis = await response.json();
            setResultData(newAnalysis);
            setIsEditing(false);

        } catch (error) {
            console.error("Error recalculating:", error);
            alert("Failed to recalculate savings. Please try again.");
        } finally {
            setIsRecalculating(false);
        }
    };

    const { comparison, metadata } = resultData;

    return (
        <div className="container">
            {metadata && metadata.city && (
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <span className="badge badge-neutral" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                        🏙️ Rates for City: <strong>{metadata.city}</strong> (Tier {getTierFromCity(metadata.city)})
                    </span>
                </div>
            )}

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">Total Bill Amount</div>
                    <div className="stat-value">{formatCurrency(comparison.total_bill_amount)}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">CGHS Estimated Total</div>
                    <div className="stat-value">{formatCurrency(comparison.cghs_total_amount)}</div>
                </div>
                <div className="stat-card" style={{ borderColor: comparison.total_overpaid > 0 ? '#ef4444' : '#10b981' }}>
                    <div className="stat-label">Potential Overpayment</div>
                    <div className="stat-value" style={{ color: comparison.total_overpaid > 0 ? '#ef4444' : '#10b981' }}>
                        {formatCurrency(comparison.total_overpaid)}
                    </div>
                </div>
            </div>

            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h2>Detailed Analysis</h2>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {!isEditing ? (
                            <>
                                <button className="btn" onClick={() => setIsEditing(true)} style={{ background: '#2563eb' }}>
                                    Edit / Correct Data
                                </button>
                                <button className="btn" onClick={onReset} style={{ background: '#6b7280' }}>
                                    Analyze Another Bill
                                </button>
                            </>
                        ) : (
                            <>
                                <button className="btn" onClick={addItem} style={{ background: '#10b981' }}>
                                    + Add Item
                                </button>
                                <button className="btn" onClick={handleRecalculate} disabled={isRecalculating} style={{ background: '#2563eb' }}>
                                    {isRecalculating ? 'Calculating...' : 'Recalculate Savings'}
                                </button>
                                <button className="btn" onClick={() => setIsEditing(false)} style={{ background: '#6b7280' }}>
                                    Cancel
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Item Description</th>
                                <th style={{ width: '150px' }}>Bill Price</th>
                                <th>CGHS Rate</th>
                                <th>Status</th>
                                <th>Variance</th>
                                {isEditing && <th style={{ width: '50px' }}></th>}
                            </tr>
                        </thead>
                        <tbody>
                            {(isEditing ? editedItems : comparison.items).map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={item.description}
                                                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #d1d5db' }}
                                            />
                                        ) : (
                                            <>
                                                <div style={{ fontWeight: '500' }}>{item.description}</div>
                                                {item.cghs_name && (
                                                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                                        Mapped to: {item.cghs_name}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </td>
                                    <td>
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                value={item.bill_price}
                                                onChange={(e) => handleItemChange(index, 'bill_price', e.target.value)}
                                                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #d1d5db' }}
                                            />
                                        ) : (
                                            formatCurrency(item.bill_price)
                                        )}
                                    </td>
                                    <td>{item.cghs_rate !== null ? formatCurrency(item.cghs_rate) : '-'}</td>
                                    <td>
                                        {item.status && (
                                            <span className={`badge ${item.status === 'Overpaid' ? 'badge-danger' :
                                                item.status === 'Matched' ? 'badge-success' :
                                                    item.status === 'Within Limit' ? 'badge-success' : 'badge-neutral'
                                                }`}>
                                                {item.status}
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ color: item.variance > 0 ? '#ef4444' : 'inherit', fontWeight: item.variance > 0 ? '600' : '400' }}>
                                        {item.variance > 0 ? `+${formatCurrency(item.variance)}` : '-'}
                                    </td>
                                    {isEditing && (
                                        <td>
                                            <button
                                                onClick={() => deleteItem(index)}
                                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }}
                                                title="Delete Item"
                                            >
                                                &times;
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AnalysisResult;
